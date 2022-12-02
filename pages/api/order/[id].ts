import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import QRCode from 'qrcode';
import prisma from '../../../lib/prisma';
import { ApiResponse } from '../../../lib/types/api';
import Invoice4UClearing from '../../../utils/api/services/i4u/api';
import KeepGoApi from '../../../utils/api/services/keepGo/api';
import { CreateLine, Line } from '../../../utils/api/services/keepGo/types';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Plan>>>
) {
  try {
    const session = await unstable_getServerSession(
      req,
      res,
      authOptions(req, res)
    );
    const { method } = req;
    if (method === 'PUT') {
      const { id } = req.query;
      const plan = await prisma.plan.findUnique({
        where: {
          id: id as string,
        },
        include: {
          payment: true,
          refill: true,
          bundle: true,
        },
      });
      if (!plan || !plan.payment || !plan.refill || !plan.bundle) {
        throw new Error('No plan found');
      }
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
        plan.payment.paymentId as string
      );
      // eslint-disable-next-line no-console
      console.log({ clearingLog: clearingLog.d[0] });
      if (!clearingLog || !clearingLog.d || clearingLog.d.length === 0) {
        throw new Error('No clearing log found');
      } else if (
        clearingLog.d[0].Errors &&
        clearingLog.d[0].Errors.length > 0
      ) {
        console.error(clearingLog.d[0].Errors);
        throw new Error(clearingLog.d[0].Errors.toString());
      }

      if (plan && plan.userId === session?.user?.id) {
        if (plan.payment?.status !== 'PAID') {
          const updatedPayment = await prisma.payment.update({
            where: {
              id: plan.paymentId as string,
            },
            data: {
              clearingConfirmationNumber:
                clearingLog.d[0].ClearingConfirmationNumber,
              paymentDate: new Date(),
              docId: clearingLog.d[0].DocId,
              isDocumentCreated: clearingLog.d[0].IsDocumentCreated,
              status: 'PAID',
              paymentMethod: {
                create: {
                  IsBitPayment: clearingLog.d[0].IsBitPayment,
                  cardType: clearingLog.d[0].CreditTypeName,
                  last4: clearingLog.d[0].CreditNumber,
                  user: {
                    connect: {
                      id: session?.user?.id,
                    },
                  },
                },
              },
            },
          });

          if (plan.payment.couponId) {
            await prisma.coupon.update({
              where: {
                id: plan.payment.couponId,
              },
              data: {
                uses: {
                  increment: 1,
                },
                users: {
                  connect: {
                    couponId_userId: {
                      couponId: plan.payment.couponId,
                      userId: plan.userId,
                    },
                  },
                },
              },
            });
          }

          const keepGoApi = new KeepGoApi(
            process.env.KEEPGO_BASE_URL || '',
            process.env.KEEPGO_API_KEY || '',
            process.env.KEEPGO_ACCESS_TOKEN || ''
          );
          const newLine = await keepGoApi.createLine({
            refillMb: plan.refill.amount_mb,
            refillDays: plan.refill.amount_days,
            bundleId: parseInt(plan.bundle.externalId, 10),
          });

          // eslint-disable-next-line no-console
          console.log({ newLine });

          if (
            !newLine ||
            newLine instanceof Error ||
            newLine.ack !== 'success'
          ) {
            throw new Error('No line created');
          }

          const newLineDetails = await keepGoApi.getLineDetails(
            (newLine.sim_card as CreateLine)?.iccid
          );

          // eslint-disable-next-line no-console
          console.log({ newLineDetails });

          if (newLineDetails instanceof Error) {
            throw new Error('No line details');
          }

          const qrCode = await QRCode.toDataURL(
            (newLineDetails.sim_card as CreateLine)?.qr_code
          );

          const newLineRecord = await prisma.line.create({
            data: {
              deactivationDate: (newLineDetails.sim_card as Line)
                ?.deactivation_date,
              allowedUsageKb: (newLineDetails.sim_card as Line)
                ?.allowed_usage_kb,
              remainingUsageKb: (newLineDetails.sim_card as Line)
                ?.remaining_usage_kb,
              remainingDays: (newLineDetails.sim_card as Line)?.remaining_days,
              status: (newLineDetails.sim_card as Line)?.status,
              autoRefillTurnedOn: (newLineDetails.sim_card as Line)
                ?.auto_refill_turned_on,
              autoRefillAmountMb: (newLineDetails.sim_card as Line)?.auto_refill_amount_mb.toString(),
              autoRefillPrice: (newLineDetails.sim_card as Line)
                ?.auto_refill_price,
              autoRefillCurrency: (newLineDetails.sim_card as Line)
                ?.auto_refill_currency,
              notes: (newLineDetails.sim_card as Line)?.notes,
              iccid: (newLine.sim_card as CreateLine)?.iccid,
              lpaCode: (newLine.sim_card as CreateLine)?.lpa_code,
              bundle: {
                connect: {
                  id: plan.bundle.id,
                },
              },
              qrCode,
            },
          });

          await prisma.plan.update({
            where: {
              id: plan.id,
            },
            data: {
              line: {
                connect: {
                  id: newLineRecord.id,
                },
              },
            },
          });

          // TODO add transactions and rollbacks

          // TODO: add data bundles and refills to line

          // TODO - send email to user with line details

          if (updatedPayment) {
            res
              .status(200)
              .json({ success: true, data: { friendlyId: plan.friendlyId } });
          } else {
            throw new Error('Payment failed');
          }
        } else {
          res.status(403).json({
            name: 'PAYMENT_ALREADY_PROCESSED',
            success: false,
            message: 'Payment already processed',
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
