import type { NextApiRequest, NextApiResponse } from 'next';
import {
  PaymentStatus,
  PaymentType,
  Plan,
  PlanStatus,
  Prisma,
} from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import { ApiResponse } from '../../../lib/types/api';
import Invoice4UClearing from '../../../utils/api/services/i4u/api';
import { authOptions } from '../auth/[...nextauth]';
import createLine, { LineStatus } from '../../../utils/createLine';

export type Item = {
  id: string;
  name: string;
  description?: string;
  coupon?: string;
  discount: number;
  price: number;
  quantity: number;
};

export type OrderData = {
  id: string;
  price: number;
  coupon?: string;
  friendlyId: string;
  items: Item[];
};

// eslint-disable-next-line consistent-return
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    ApiResponse<
      | Partial<
          Plan &
            Prisma.PlanGetPayload<{
              select: {
                planModel: { select: { name: true; description: true } };
              };
            }>
        >
      | {
          id: string;
          price: number;
          coupon?: string;
          friendlyId: string;
          items: Item[];
        }
    >
  >
) {
  try {
    const session = await unstable_getServerSession(
      req,
      res,
      authOptions(req, res)
    );
    const { method } = req;
    if (method === 'GET') {
      const { id: orderId, action } = req.query;

      if (action === 'finish') {
        const plan = await prisma.plan.findUnique({
          where: {
            id: orderId as string,
          },
          include: {
            user: true,
            refill: {
              include: {
                bundle: true,
              },
            },
            country: true,
            planModel: true,
          },
        });

        if (!plan) {
          throw new Error('No plan found');
        }

        res.status(200).json({
          success: true,
          data: plan,
        });
      } else {
        const plan = await prisma.plan.findUnique({
          where: {
            id: orderId as string,
          },
          select: {
            id: true,
            price: true,
            friendlyId: true,
            planModel: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
              },
            },
            payment: {
              select: {
                coupon: true,
              },
            },
            user: true,
          },
        });

        if (!plan) {
          throw new Error('No plan found');
        }

        // If no session or user is not the owner of the plan and user is not admin
        if (
          !session ||
          (plan.user.id !== session?.user.id && session?.user.role !== 'ADMIN')
        ) {
          res.redirect(
            302,
            `${process.env.NEXT_PUBLIC_BASE_URL}/error?error=Order`
          );
        }

        res.status(200).json({
          success: true,
          data: {
            id: plan.id,
            price: plan.price,
            friendlyId: plan.friendlyId,
            coupon: plan.payment?.coupon?.code,
            items: [
              {
                id: plan.planModel.id,
                name: plan.planModel.name,
                description: plan.planModel.description || undefined,
                coupon: plan.payment?.coupon?.code,
                discount: plan.planModel.price - plan.price,
                price: plan.planModel.price,
                quantity: 1,
              },
            ],
          },
        });
      }
    } else if (method === 'PUT') {
      const { id } = req.query;
      const {
        payment: { paymentType },
      } = req.body;
      const isBitPayment = paymentType === PaymentType.BIT;

      // Get plan, payment, refill, bundle, and user
      const plan = await prisma.plan.findUnique({
        where: {
          id: id as string,
        },
        include: {
          planModel: {
            include: {
              refill: {
                include: {
                  bundle: true,
                },
              },
            },
          },
          payment: {
            include: {
              coupon: true,
            },
          },
          user: true,
        },
      });

      // Check if plan exists
      if (
        !plan ||
        !plan.planModel ||
        !plan.planModel.refill ||
        !plan.planModel.refill.bundle ||
        !plan.user
      ) {
        throw new Error('No plan found');
      }

      // *** Payment ***
      const i4uApi = new Invoice4UClearing(
        process.env.INVOICE4U_API_KEY!,
        process.env.INVOICE4U_USER!,
        process.env.INVOICE4U_PASSWORD!,
        process.env.INVOICE4U_TEST === 'true'
      );
      if (!i4uApi.isVerified) {
        await i4uApi.verifyLogin();
      }
      const clearingLog = await i4uApi.getClearingLogByParams(
        plan.payment?.paymentId as string
      );
      // eslint-disable-next-line no-console
      console.log({ clearingLog: clearingLog.d[0] });

      if (!process.env.INVOICE4U_TEST) {
        if (
          !clearingLog ||
          !clearingLog.d ||
          !clearingLog.d[0] ||
          clearingLog.d.length === 0
        ) {
          throw new Error('No clearing log found');
        } else if (
          clearingLog.d[0]?.Errors &&
          clearingLog.d[0]?.Errors.length > 0
        ) {
          console.error(clearingLog.d[0].Errors);
          throw new Error(clearingLog.d[0].Errors.toString());
        }
      }

      // Update payment and payment method
      if (plan && plan.userId === session?.user?.id) {
        if (plan.payment?.status !== PaymentStatus.PAID) {
          const paymentMethod = await prisma.paymentMethod.update({
            where: {
              id: plan.payment?.paymentMethodId as string,
            },
            data: {
              paymentType: isBitPayment
                ? PaymentType.BIT
                : PaymentType.CREDIT_CARD,
              isBitPayment: clearingLog.d[0]?.IsBitPayment,
              cardType: clearingLog.d[0]?.CreditTypeName || '',
              last4: clearingLog.d[0]?.CreditNumber || '',
              user: {
                connect: {
                  id: session?.user?.id as string,
                },
              },
            },
          });
          const updatedPayment = await prisma.payment.update({
            where: {
              id: plan.paymentId as string,
            },
            data: {
              clearingConfirmationNumber:
                clearingLog.d[0]?.ClearingConfirmationNumber,
              paymentDate: new Date(),
              docId: clearingLog.d[0]?.DocId,
              isDocumentCreated: clearingLog.d[0]?.IsDocumentCreated,
              status: PaymentStatus.PAID,
              paymentMethodId: paymentMethod.id,
            },
          });

          if (!updatedPayment) {
            throw new Error('Payment not updated');
          }

          // Handle coupon, if exists
          if (plan.payment?.couponId) {
            await prisma.coupon.update({
              where: {
                id: plan.payment.couponId,
              },
              data: {
                uses: {
                  increment: 1,
                },
                users: {
                  create: [
                    {
                      user: {
                        connect: {
                          id: plan.userId,
                        },
                      },
                    },
                  ],
                },
              },
            });
          }

          // *** Line ***
          if (!plan.lineId) {
            const { status: lineStatus, lineDetails } = await createLine({
              planId: plan.id,
              planFriendlyId: plan.friendlyId,
              refillMb: plan.planModel.refill.amount_mb,
              refillDays: plan.planModel.refill.amount_days,
              bundleExternalId: parseInt(
                plan.planModel.refill.bundle.externalId,
                10
              ),
              userEmail: plan.user.emailEmail,
              userFirstName: plan.user.firstName!,
              userLastName: plan.user.lastName!,
            });

            // If line wasn't created - send pending email and update plan status
            if (
              lineStatus === LineStatus.CREATED_WITHOUT_LINE ||
              !lineDetails
            ) {
              await prisma.plan.update({
                where: {
                  id: plan.id,
                },
                data: {
                  status: 'PENDING',
                },
              });

              return res.status(200).json({
                name: 'ORDER_CREATED_WITHOUT_LINE',
                success: false,
                message: plan.friendlyId.toString(),
              });
            }

            await prisma.plan.update({
              where: {
                id: plan.id,
              },
              data: {
                status: PlanStatus.ACTIVE,
                line: {
                  connect: {
                    id: lineDetails.id,
                  },
                },
              },
            });

            // TODO add transactions and rollbacks

            // TODO: add data bundles and refills to line

            res.status(200).json({
              success: true,
              data: {
                id: plan.id,
                price: plan.price,
                coupon: plan.payment?.coupon?.code,
                friendlyId: plan.friendlyId,
                items: [
                  {
                    id: plan.planModel.id,
                    name: plan.planModel.name,
                    coupon: plan.payment?.coupon?.code,
                    discount: plan.planModel.price - plan.price,
                    price: plan.planModel.price,
                    quantity: 1,
                  },
                ],
              },
            });
          }
        } else {
          res.status(200).json({
            name: 'PAYMENT_ALREADY_PROCESSED',
            success: false,
            message: plan.friendlyId.toString(),
          });
        }
      } else {
        res.status(403).json({
          name: 'ORDER_CREATION_ERR',
          message: 'Plan not found or user not logged in',
          success: false,
        });
      }
    } else {
      res.status(405).json({
        name: 'METHOD_NOT_ALLOWED',
        success: false,
        message: 'Method not allowed',
      });
    }
  } catch (e: unknown) {
    console.error(e);
    res.status(500).json({
      name: 'ORDER_UPDATE_ERR',
      message: 'Something went wrong',
      success: false,
    });
  }
}
