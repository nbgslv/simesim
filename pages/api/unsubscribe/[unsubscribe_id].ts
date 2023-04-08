import type { NextApiRequest, NextApiResponse } from 'next';
import {
  Unsubscribe,
  UnsubscribeType,
  MessagesType,
  Prisma,
} from '@prisma/client';
import * as yup from 'yup';
import prisma from '../../../lib/prisma';
import { ApiResponse } from '../../../lib/types/api';

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
  res: NextApiResponse<ApiResponse<Partial<Unsubscribe> | null>>
) {
  try {
    const { method } = req;
    if (method === 'GET') {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { unsubscribe_id } = req.query;

      const messageData = await prisma.messages.findUnique({
        where: {
          token: unsubscribe_id as string,
          paymentId: {
            not: null,
          },
        },
        include: {
          user: true,
        },
      });

      if (!messageData) {
        throw new Error("Original message wasn't found");
      }

      const data = await prisma.unsubscribe.findUnique({
        where: {
          userId: messageData.user!.id,
        },
      });

      if (!data) {
        return res.status(200).json({
          success: true,
          data: null,
        });
      }

      res.status(200).json({
        success: true,
        data,
      });
    } else if (method === 'POST') {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { unsubscribe_id } = req.query;
      const {
        whatsapp,
        updatesEmail,
        sms,
        commercial,
        notifications,
      } = req.body;

      const postSchema = yup.object({
        unsubscribe_id: yup.string().required(),
        whatsapp: yup.boolean().required(),
        updatesEmail: yup.boolean().required(),
        sms: yup.boolean().required(),
        commercial: yup.boolean().required(),
        notifications: yup.boolean().required(),
      });

      await postSchema.validate({
        unsubscribe_id,
        whatsapp,
        updatesEmail,
        sms,
        commercial,
        notifications,
      });

      const messageData = await prisma.messages.findUnique({
        where: {
          token: unsubscribe_id as string,
        },
        include: {
          user: true,
        },
      });

      if (!messageData) {
        throw new Error("Original message wasn't found");
      }

      const unsubscribeType: Prisma.Enumerable<UnsubscribeType> = [];

      if (!whatsapp) {
        unsubscribeType.push(UnsubscribeType.WHATSAPP);
      }
      if (!updatesEmail) {
        unsubscribeType.push(UnsubscribeType.EMAIL);
      }
      if (!sms) {
        unsubscribeType.push(UnsubscribeType.SMS);
      }

      const messagesType: Prisma.Enumerable<MessagesType> = [];

      if (!commercial) {
        messagesType.push(MessagesType.COMMERCIAL);
      }
      if (!notifications) {
        messagesType.push(MessagesType.NOTIFICATION);
      }

      const data = await prisma.unsubscribe.upsert({
        where: {
          userId: messageData.user!.id,
        },
        update: {
          type: unsubscribeType,
          messageType: messagesType,
        },
        create: {
          user: {
            connect: {
              id: messageData.user!.id,
            },
          },
          type: unsubscribeType,
          messageType: messagesType,
        },
      });

      if (!data) {
        throw new Error('Something went wrong');
      }

      res.status(200).json({
        success: true,
        data,
      });
    } else if (method === 'DELETE') {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { unsubscribe_id } = req.query;
      const { email } = req.body;

      const deleteSchema = yup.object({
        unsubscribe_id: yup.string().required(),
        email: yup.string().email().required(),
      });

      await deleteSchema.validate({
        unsubscribe_id,
        email,
      });

      const messageData = await prisma.messages.findUnique({
        where: {
          token: unsubscribe_id as string,
        },
        include: {
          user: true,
        },
      });

      if (!messageData) {
        throw new Error("Original message wasn't found");
      }

      if (messageData.user!.emailEmail !== email) {
        res.status(404).json({
          name: 'USER_NOT_FOUND',
          message: 'User not found',
          success: false,
        });
      }

      const unsubscribeType: Prisma.Enumerable<UnsubscribeType> = [
        UnsubscribeType.EMAIL,
        UnsubscribeType.SMS,
        UnsubscribeType.WHATSAPP,
      ];

      const messagesType: Prisma.Enumerable<MessagesType> = [
        MessagesType.COMMERCIAL,
        MessagesType.NOTIFICATION,
      ];

      const data = await prisma.unsubscribe.upsert({
        where: {
          userId: messageData.user!.id,
        },
        update: {
          type: unsubscribeType,
          messageType: messagesType,
        },
        create: {
          user: {
            connect: {
              id: messageData.user!.id,
            },
          },
          type: unsubscribeType,
          messageType: messagesType,
        },
      });

      if (!data) {
        throw new Error('Something went wrong');
      }

      res.status(200).json({
        success: true,
        data,
      });
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
      name: 'UNSUBSCRIBE_ERROR',
      message: 'Something went wrong',
      success: false,
    });
  }
}
