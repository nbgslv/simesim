import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import paypal, { Payment, SDKError } from 'paypal-rest-sdk';
import { PaymentStatus, PlanStatus } from '@prisma/client';
import { PaymentType } from '../../../../../utils/api/services/i4u/types';
import { ApiResponse } from '../../../../../lib/types/api';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '../../../../../lib/prisma';
import createLine, { LineStatus } from '../../../../../utils/createLine';
import Invoice4UClearing from '../../../../../utils/api/services/i4u/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'POST') {
      if (!session) {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { orderId, paymentId, payerId } = req.body;
      const plan = await prisma.plan.findUnique({
        where: {
          id: orderId as string,
        },
        include: {
          planModel: true,
          user: true,
        },
      });
      paypal.configure({
        mode: process.env.CUSTOM_ENV === 'production' ? 'live' : 'sandbox',
        client_id: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        client_secret: process.env.PAYPAL_CLIENT_SECRET!,
      });
      paypal.payment.execute(
        paymentId as string,
        { payer_id: payerId },
        async (error: SDKError, payment: Payment) => {
          if (error) {
            console.error(error);
            console.error(error.response.details);
            throw new Error(error.message);
          } else if (payment.state === 'approved') {
            const i4uApi = new Invoice4UClearing(
              process.env.INVOICE4U_API_KEY!,
              process.env.INVOICE4U_USER!,
              process.env.INVOICE4U_PASSWORD!,
              process.env.INVOICE4U_TEST === 'true'
            );

            await i4uApi.verifyLogin();
            const i4uResponse = await i4uApi.sendInvoice({
              customerName: `${plan?.user.firstName} ${plan?.user.lastName}`,
              payments: [
                {
                  Amount: parseInt(payment.transactions[0].amount.total, 10),
                  PaymentType: PaymentType.Other,
                  PaymentTypeLiteral: 'PayPal',
                  // eslint-disable-next-line no-useless-escape
                  Date: `\/Date(${Date.now()})\/`,
                },
              ],
              items: [
                {
                  Name: plan?.planModel.name as string,
                  Quantity: 1,
                  Price: parseInt(payment.transactions[0].amount.total, 10),
                },
              ],
              emails: [
                {
                  Mail: plan?.user.emailEmail as string,
                  IsUserMail: false,
                },
              ],
            });

            const updatedPlan = await prisma.plan.update({
              where: { id: orderId as string },
              data: {
                status: PlanStatus.ACTIVE,
                payment: {
                  update: {
                    status: PaymentStatus.PAID,
                    paymentId: payment.id,
                    paymentDate: payment.update_time,
                    docId: i4uResponse.d.ID,
                  },
                },
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
                payment: true,
                user: true,
              },
            });

            // Handle coupon, if exists
            if (updatedPlan.payment?.couponId) {
              await prisma.coupon.update({
                where: {
                  id: updatedPlan.payment.couponId,
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
                            id: updatedPlan.userId,
                          },
                        },
                      },
                    ],
                  },
                },
              });
            }

            const { status: lineStatus, lineDetails } = await createLine({
              planId: updatedPlan.id,
              planFriendlyId: updatedPlan.friendlyId,
              refillMb: updatedPlan.planModel.refill.amount_mb,
              refillDays: updatedPlan.planModel.refill.amount_days,
              bundleExternalId: parseInt(
                updatedPlan.planModel.refill.bundle.externalId,
                10
              ),
              userEmail: updatedPlan.user.emailEmail,
              userFirstName: updatedPlan.user.firstName!,
              userLastName: updatedPlan.user.lastName!,
            });

            // eslint-disable-next-line no-console
            console.log({ lineStatus, lineDetails });

            // If line wasn't created - send pending email and update plan status
            if (
              lineStatus === LineStatus.CREATED_WITHOUT_LINE ||
              !lineDetails
            ) {
              await prisma.plan.update({
                where: {
                  id: updatedPlan.id,
                },
                data: {
                  status: PlanStatus.PENDING_LINE,
                },
              });

              res.status(200).json({
                name: 'ORDER_CREATED_WITHOUT_LINE',
                success: false,
                message: updatedPlan.friendlyId.toString(),
              });
            } else {
              await prisma.plan.update({
                where: {
                  id: updatedPlan.id,
                },
                data: {
                  line: {
                    connect: {
                      id: lineDetails.id,
                    },
                  },
                },
              });

              res.status(200).json({
                success: true,
                data: { friendlyId: updatedPlan.friendlyId },
              });
            }
          } else {
            res.status(400).json({
              name: 'PAYMENT_NOT_APPROVED',
              success: false,
              message: 'Payment not approved',
            });
          }
        }
      );
    } else {
      res.status(405).json({
        name: 'METHOD_NOT_ALLOWED',
        success: false,
        message: 'Method not allowed',
      });
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({
      name: 'CONTACT_CREATION_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
