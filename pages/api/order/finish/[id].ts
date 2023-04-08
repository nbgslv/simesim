import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { PaymentStatus } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { ApiResponse } from '../../../../lib/types/api';
import { authOptions } from '../../auth/[...nextauth]';

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
  res: NextApiResponse<ApiResponse<{ action: string }>>
) {
  try {
    const session = await unstable_getServerSession(
      req,
      res,
      authOptions(req, res)
    );
    const { method } = req;
    if (method === 'POST') {
      const { id } = req.query;

      const plan = await prisma.plan.findUnique({
        where: {
          id: id as string,
        },
      });

      if (!plan) {
        throw new Error('Plan not found');
      }

      const updatedPlan = await prisma.plan.update({
        where: {
          id: id as string,
        },
        data: {
          payment: {
            create: {
              amount: plan.price,
              status: PaymentStatus.PENDING,
              user: {
                connect: {
                  id: plan.userId,
                },
              },
            },
          },
        },
        include: {
          user: true,
        },
      });

      if (!updatedPlan) {
        throw new Error('Plan not found');
      }

      if (
        !session ||
        (updatedPlan?.userId !== session?.user.id &&
          session?.user.role !== 'ADMIN')
      ) {
        res.status(200).json({
          success: true,
          data: {
            action: 'authenticate',
          },
        });
      } else {
        res.status(200).json({
          success: true,
          data: {
            action: 'payment',
          },
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
      name: 'PLAN_UPDATE_ERR',
      message: 'Something went wrong',
      success: false,
    });
  }
}
