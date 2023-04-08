import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';
import { ApiResponse } from '../../../../lib/types/api';
import { toFixedNumber } from '../../../../utils/math';

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
  res: NextApiResponse<ApiResponse<string>>
) {
  try {
    const { method } = req;
    if (method === 'PUT') {
      const { id } = req.query;
      const { bundleId, countryId } = req.body;

      const plan = await prisma.plan.findUnique({
        where: {
          id: id as string,
        },
        include: {
          payment: {
            include: {
              coupon: true,
            },
          },
        },
      });

      if (!plan) {
        throw new Error('Plan not found');
      }

      const newPlanModel = await prisma.planModel.findUnique({
        where: {
          id: bundleId,
        },
      });

      if (!newPlanModel) {
        throw new Error('New plan model not found');
      }

      let { price } = newPlanModel;
      if (plan.payment?.coupon) {
        const { coupon } = plan.payment;
        if (coupon.discountType === 'PERCENT') {
          price = toFixedNumber(price - (price * coupon.discount) / 100, 2);
        } else if (coupon.discountType === 'AMOUNT') {
          price = toFixedNumber(price - coupon.discount, 2);
        }
      }

      await prisma.plan.update({
        where: {
          id: id as string,
        },
        data: {
          planModel: {
            connect: {
              id: bundleId,
            },
          },
          refill: {
            connect: {
              id: newPlanModel?.refillId,
            },
          },
          country: {
            connect: {
              id: countryId,
            },
          },
          price,
        },
      });
      res.status(200).json({ success: true, data: 'true' });
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
