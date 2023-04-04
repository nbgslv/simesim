import { differenceInHours, isAfter } from 'date-fns';
import {
  PaymentStatus,
  MessageSubject,
  MessageType,
  MessageStatus,
  PlanStatus,
} from '@prisma/client';
import inngest from './client';
import prisma from '../../lib/prisma';
import Email from '../email';
import TwilioApi from '../api/services/twilio/twilio';
import ShortIoApi from '../api/services/short.io/short';

export default inngest.createFunction(
  {
    name: 'Abandoned carts',
  },
  { cron: '0 6-22/2 * * *' },
  async () => {
    const DDATE = new Date(2023, 3, 1, 0, 0, 0, 0); // 2023-04-01 00:00:00
    try {
      const defaultSettings = {
        paymentTimeRanges: [24, 48, 72],
        messagesTypes: ['email', 'email', 'email'],
      };

      const settings = {
        ...defaultSettings,
        ...JSON.parse(
          (
            await prisma.settings.findFirst({
              where: { name: 'abandonedCarts' },
            })
          )?.value ?? '{}'
        ),
      };

      if (settings.enabled !== 'true')
        return { status: 'Abandoned carts mission not enabled' };

      const plans = await prisma.plan.findMany({
        where: {
          status: PlanStatus.PENDING,
          payment: {
            status: PaymentStatus.PENDING,
          },
        },
        include: {
          planModel: true,
          country: true,
          payment: true,
          user: true,
          refill: true,
        },
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const plan of plans) {
        const messagesSent = await prisma.messages.count({
          where: {
            AND: [
              { subject: MessageSubject.ABANDONED_CART },
              { userId: plan.userId },
              { paymentId: plan.paymentId },
            ],
          },
        });
        if (messagesSent >= 0 && messagesSent < 3) {
          if (
            Math.abs(
              differenceInHours(
                plan.payment?.createdAt ?? new Date(),
                new Date()
              )
            ) >= settings.paymentTimeRanges[messagesSent] &&
            isAfter(plan.payment?.createdAt ?? new Date(), DDATE)
          ) {
            const messageTypePromise = async () => {
              if (settings.messagesTypes[messagesSent] === 'email') {
                const emailService = new Email();
                const recipients = [
                  emailService.setRecipient(
                    plan.user.emailEmail,
                    `${plan.user.firstName} ${plan.user.lastName}`
                  ),
                ];
                const emailVariables = [
                  {
                    email: plan.user.emailEmail,
                    substitutions: [
                      {
                        var: 'email',
                        value: plan.user.emailEmail,
                      },
                      {
                        var: 'price',
                        value: plan.payment?.amount.toFixed(2) ?? '0',
                      },
                      {
                        var: 'fullName',
                        value: `${plan.user.firstName} ${plan.user.lastName}`,
                      },
                      {
                        var: 'planDays',
                        value: plan?.refill?.amount_days?.toString() ?? '365',
                      },
                      {
                        var: 'orderLink',
                        value: `${process.env.NEXT_PUBLIC_BASE_URL}/order/finish/${plan.id}`,
                      },
                      {
                        var: 'planName',
                        value: plan.planModel.name,
                      },
                      {
                        var: 'planDescription',
                        value: plan.planModel.description ?? '',
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
                const twilioApi = new TwilioApi(
                  process.env.TWILIO_ACCOUNT_SID!,
                  process.env.TWILIO_AUTH_TOKEN!,
                  process.env.TWILIO_VERIFY_SID!
                );
                const shortUrl = await ShortIoApi.shortenUrl(
                  `${process.env.NEXT_PUBLIC_BASE_URL}/order/finish/${plan.id}`
                );
                await twilioApi.sendWhatsappMessage(
                  plan.user.email,
                  `היי ${plan.user.firstName}.
שמנו לב שלא השלמת את הרכישה של חבילת eSim ל${plan.country?.translation}
. יש לך שאלות או דאגות כלשהן לגבי ההזמנה? נשמח אם תוכלו לומר לנו כיצד נוכל לסייע, בכל עניין. נשמח לוודא שתקבלו את חוויית הקנייה הטובה ביותר.
כדי להשלים את הרכישה, פשוט בקרו בלינק: ${shortUrl}

בברכה,
צוות שים eSim`
                );
                return MessageType.WHATSAPP;
              }
              return null;
            };

            const messageType = await messageTypePromise();
            if (!messageType)
              return {
                status: 'No message sent',
              };
            await prisma.messages.create({
              data: {
                subject: MessageSubject.ABANDONED_CART,
                type: messageType,
                status: MessageStatus.SENT,
                paymentId: plan.paymentId,
                user: {
                  connect: {
                    id: plan.userId,
                  },
                },
              },
            });
          }
        }
      }
      return {
        status: 'Messages sent',
      };
    } catch (error) {
      console.error(error);
      return {
        status: (error as Error).message,
      };
    }
  }
);
