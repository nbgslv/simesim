import { differenceInHours, parseISO } from 'date-fns';
import {
  PaymentStatus,
  MessageSubject,
  MessageType,
  MessageStatus,
} from '@prisma/client';
import inngest from './client';
import prisma from '../../lib/prisma';
import Email from '../email';

export default inngest.createFunction(
  {
    name: 'Abandoned carts',
  },
  { cron: 'TZ=Asia/Jerusalem 0 6-22/2 * * *' },
  async ({ step }) => {
    const defaultSettings = {
      paymentTimeRanges: [24, 48, 72],
      messagesTypes: ['email', 'email', 'email'],
    };
    const settings = {
      ...defaultSettings,
      ...JSON.parse(
        (
          await step.run('Get settings', () =>
            prisma.settings.findFirst({ where: { name: 'abandonedCarts' } })
          )
        )?.value ?? '{}'
      ),
    };

    const payments = await step.run('Get abandoned carts', () =>
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.PENDING,
        },
        include: {
          user: true,
          plan: {
            include: {
              planModel: true,
              refill: true,
            },
          },
        },
      })
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const payment of payments) {
      const messageType: MessageType | null = await step.run(
        'Send abandoned cart message',
        async () => {
          const messagesSent = await prisma.messages.count({
            where: {
              AND: [
                { subject: MessageSubject.ABANDONED_CART },
                { userId: payment.userId },
              ],
            },
          });
          if (messagesSent >= 0 && messagesSent < 3) {
            if (
              differenceInHours(parseISO(payment.createdAt), new Date()) >=
              settings.paymentTimeRanges[messagesSent]
            ) {
              if (settings.messagesTypes[messagesSent] === 'email') {
                const emailService = new Email();
                const recipients = [
                  emailService.setRecipient(
                    payment.user.emailEmail,
                    `${payment.user.firstName} ${payment.user.lastName}`
                  ),
                ];
                const emailVariables = [
                  {
                    email: payment.user.emailEmail,
                    substitutions: [
                      {
                        var: 'email',
                        value: payment.user.emailEmail,
                      },
                      {
                        var: 'price',
                        value: payment.amount.toFixed(2),
                      },
                      {
                        var: 'fullName',
                        value: `${payment.user.firstName} ${payment.user.lastName}`,
                      },
                      {
                        var: 'planDays',
                        value:
                          payment.plan?.refill?.amount_days?.toString() ??
                          '365',
                      },
                      {
                        var: 'orderLink',
                        value: `${
                          process.env.NEXT_PUBLIC_SITE_URL
                        }/order/finish/${payment.plan?.id ?? '?error=planId'}}`,
                      },
                      {
                        var: 'planName',
                        value: payment.plan?.planModel.name ?? '',
                      },
                      {
                        var: 'planDescription',
                        value: payment.plan?.planModel.description ?? '',
                      },
                    ],
                  },
                ];
                emailService.setEmailParams(
                  'order@simesim.co.il',
                  'שים eSim',
                  recipients,
                  'הזמנתך מאתר שים eSim',
                  process.env.EMAIL_TEMPLATE_USER_ABANDONED_CART || '',
                  undefined,
                  undefined,
                  emailVariables
                );
                await emailService.send();
                return MessageType.EMAIL;
              }
              if (settings.messagesTypes[messagesSent] === 'whatsapp') {
                // await sendWhatsapp();
                return MessageType.WHATSAPP;
              }
            }
          }
          return null;
        }
      );
      if (!messageType)
        return {
          status: 'No message sent',
        };
      await step.run('Create message record', () =>
        prisma.messages.create({
          data: {
            subject: MessageSubject.ABANDONED_CART,
            type: messageType,
            status: MessageStatus.SENT,
            user: {
              connect: {
                id: payment.userId,
              },
            },
          },
        })
      );
    }
    return {
      status: 'Messages sent',
    };
  }
);
