import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import QRCode from 'qrcode';
// @ts-ignore
import MailerSend from 'mailersend';
import prisma from '../../../lib/prisma';
import { ApiResponse } from '../../../lib/types/api';
import Invoice4UClearing from '../../../utils/api/services/i4u/api';
import KeepGoApi from '../../../utils/api/services/keepGo/api';
import { CreateLine, Line } from '../../../utils/api/services/keepGo/types';
import { authOptions } from '../auth/[...nextauth]';

// eslint-disable-next-line consistent-return
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

      // Get plan, payment, refill, bundle, and user
      const plan = await prisma.plan.findUnique({
        where: {
          id: id as string,
        },
        include: {
          payment: true,
          refill: true,
          bundle: true,
          user: true,
        },
      });

      // Check if plan exists
      if (
        !plan ||
        !plan.payment ||
        !plan.refill ||
        !plan.bundle ||
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
        plan.payment.paymentId as string
      );
      // eslint-disable-next-line no-console
      console.log({ clearingLog: clearingLog.d[0] });
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

      // Update payment and payment method
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

          if (!updatedPayment) {
            throw new Error('Payment not updated');
          }

          // Handle coupon, if exists
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

          // *** Line ***
          if (!plan.lineId) {
            const keepGoApi = new KeepGoApi(
              process.env.KEEPGO_BASE_URL || '',
              process.env.KEEPGO_API_KEY || '',
              process.env.KEEPGO_ACCESS_TOKEN || ''
            );

            // Create line
            const newLine = await keepGoApi.createLine({
              refillMb: plan.refill.amount_mb,
              refillDays: plan.refill.amount_days,
              bundleId: parseInt(plan.bundle.externalId, 10),
            });

            // eslint-disable-next-line no-console
            console.log({ newLine });

            // Instantiate email client
            const { Recipient, EmailParams } = MailerSend;

            const mailerSend = new MailerSend({
              api_key: process.env.MAILER_SNED_API_KEY || '',
            });

            const recipients = [
              new Recipient(
                plan.user.emailEmail,
                `${plan.user.firstName} ${plan.user.lastName}`
              ),
            ];

            // If line wasn't created - send pending email and update plan status
            if (
              !newLine ||
              newLine instanceof Error ||
              newLine.ack !== 'success'
            ) {
              await prisma.plan.update({
                where: {
                  id: plan.id,
                },
                data: {
                  status: 'PENDING',
                },
              });

              const bcc = [
                new Recipient('nbgslv@gmail.com', 'נחמן בוגוסלבסקי'),
              ];
              const emailParams = new EmailParams()
                .setFrom('order@simesim.co.il')
                .setFromName('simEsim')
                .setRecipients(recipients)
                .setBcc(bcc)
                .setTemplateId(
                  process.env.EMAIL_TEMPLATE_USER_PENDING_LINE || ''
                )
                .setSubject('הזמנתך מאתר שים eSim')
                .setVariables([
                  {
                    email: plan.user.emailEmail,
                    substitutions: [
                      {
                        var: 'fullName',
                        value: `${plan.user.firstName} ${plan.user.lastName}`,
                      },
                      {
                        var: 'orderId',
                        value: plan.friendlyId,
                      },
                    ],
                  },
                ]);
              const emailPending = await mailerSend.send(emailParams);
              // eslint-disable-next-line no-console
              console.log({ emailPending });

              return res.status(200).json({
                name: 'ORDER_CREATED_WITHOUT_LINE',
                success: false,
                message: plan.id,
              });
            }

            // Get full line details and create line record
            const newLineDetails = await keepGoApi.getLineDetails(
              (newLine.sim_card as CreateLine)?.iccid
            );

            // eslint-disable-next-line no-console
            console.log({ newLineDetails });

            if (newLineDetails instanceof Error) {
              throw new Error('No line details');
            }

            const qrCode = await QRCode.toDataURL(
              (newLineDetails.sim_card as CreateLine)?.lpa_code
            );

            const newLineRecord = await prisma.line.create({
              data: {
                deactivationDate:
                  (newLineDetails.sim_card as Line)?.deactivation_date || null,
                allowedUsageKb: (newLineDetails.sim_card as Line)
                  ?.allowed_usage_kb,
                remainingUsageKb: (newLineDetails.sim_card as Line)
                  ?.remaining_usage_kb,
                remainingDays:
                  (newLineDetails.sim_card as Line)?.remaining_days || null,
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

            // Send new order email to user
            const emailParams = new EmailParams()
              .setFrom('order@simesim.co.il')
              .setFromName('simEsim')
              .setRecipients(recipients)
              .setTemplateId(process.env.EMAIL_TEMPLATE_USER_NEW_LINE || '')
              .setSubject('הזמנתך מאתר שים eSim')
              .setAttachments([
                {
                  content: qrCode.replace(/^data:image\/png;base64,/, ''),
                  filename: 'qrCode.png',
                  disposition: 'inline',
                  id: 'qrCode',
                },
              ])
              .setVariables([
                {
                  email: plan.user.emailEmail,
                  substitutions: [
                    {
                      var: 'fullName',
                      value: `${plan.user.firstName} ${plan.user.lastName}`,
                    },
                    {
                      var: 'orderId',
                      value: plan.friendlyId,
                    },
                    {
                      var: 'amountDays',
                      value: plan.refill.amount_days,
                    },
                  ],
                },
              ]);

            const emailOrder = await mailerSend.send(emailParams);
            // eslint-disable-next-line no-console
            console.log({ emailOrder });

            res
              .status(200)
              .json({ success: true, data: { friendlyId: plan.friendlyId } });
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
