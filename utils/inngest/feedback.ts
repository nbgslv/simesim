import {
  MessageSubject,
  MessageType,
  MessageStatus,
  PlanStatus,
  MessageDirection,
} from '@prisma/client';
import cuid from 'cuid';
import inngest from './client';
import prisma from '../../lib/prisma';
import Email from '../email';
// @ts-ignore
import feedbackHtml from '../../lib/emailTemplates/feedback.html';

export default inngest.createFunction(
  {
    name: 'Feedback',
  },
  { cron: '0 6-22/2 * * *' },
  async () => {
    const DDATE = new Date(2023, 3, 1, 0, 0, 0, 0); // 2023-04-01 00:00:00
    try {
      const settings = {
        ...JSON.parse(
          (
            await prisma.settings.findFirst({
              where: { name: 'feedback' },
            })
          )?.value ?? '{}'
        ),
      };

      if (settings.enabled !== true)
        return { status: 'Feedback mission not enabled' };

      const plans = await prisma.plan.findMany({
        where: {
          status: PlanStatus.EXPIRED,
          line: {
            expiredAt: {
              gte: DDATE,
            },
          },
        },
        include: {
          user: true,
        },
      });

      // eslint-disable-next-line no-restricted-syntax
      for (const plan of plans) {
        const messageSent = await prisma.messages.count({
          where: {
            subject: MessageSubject.FEEDBACK,
            userId: plan.userId,
          },
        });

        if (messageSent === 0) {
          const unsubscribeId = cuid();
          const emailService = new Email();
          await emailService.sendSmtpEmail(
            feedbackHtml,
            'החבילה שלך בשים eSim נגמרה',
            plan.user.emailEmail,
            {
              fullName: `${plan.user.firstName} ${plan.user.lastName}`,
              feedbackLink: `${process.env.FEEDBACK_URL || ''}?planId=${
                plan.id
              }`,
              userId: unsubscribeId,
            }
          );

          await prisma.messages.create({
            data: {
              token: unsubscribeId,
              subject: MessageSubject.FEEDBACK,
              type: MessageType.EMAIL,
              status: MessageStatus.SENT,
              paymentId: plan.paymentId,
              direction: MessageDirection.OUTBOUND,
              user: {
                connect: {
                  id: plan.userId,
                },
              },
            },
          });
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
