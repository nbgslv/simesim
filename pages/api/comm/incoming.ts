import type { NextApiRequest, NextApiResponse } from 'next';
import cuid from 'cuid';
import {
  MessageStatus,
  MessageSubject,
  MessageType,
  MessageDirection,
} from '@prisma/client';
import prisma from '../../../lib/prisma';
import Email from '../../../utils/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      // eslint-disable-next-line no-console
      console.log({ body: req.body });
      const { To, From, Body, MessageSid } = req.body;
      // Currently supports whatsapp incoming messages only
      if (To.includes('whatsapp')) {
        const formattedLocalNumber = From.replace('whatsapp:+972', '0');
        const user = await prisma.user.findUnique({
          where: {
            email: formattedLocalNumber,
          },
        });
        const userConnect = user?.id ? { connect: { id: user.id } } : undefined;
        const newMessageRecord = await prisma.messages.create({
          data: {
            from: formattedLocalNumber,
            token: cuid(),
            user: userConnect,
            type: MessageType.WHATSAPP,
            subject: MessageSubject.INCOMING,
            body: Body,
            externalId: MessageSid,
            status: MessageStatus.DELIVERED,
            direction: MessageDirection.INBOUND,
          },
        });
        const notificationEmailService = new Email();
        await notificationEmailService.sendNotificationEmail(
          `<b>התקבלה הודעת Whatsapp חדשה מ-${formattedLocalNumber} ${
            user?.firstName || ''
          } ${
            user?.lastName || ''
          }</b><br /><br /><b>ההודעה:</b><br />${Body}<br /><br /><b>נקלטה בצורה הבאה:</b><br />${newMessageRecord.toString()}`,
          `התקבלה הודעת Whatsapp חדשה מ-${formattedLocalNumber}`
        );
      }
      res
        .setHeader('Content-Type', 'text/xml')
        .status(200)
        .send('<Response></Response>');
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
