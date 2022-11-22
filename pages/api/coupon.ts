import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma, Country } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Prisma.CountrySelect | unknown>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const newCouponData = req.body;

      const PlanModel = newCouponData.planModel
        ? {
            connect: {
              id: newCouponData.planModel,
            },
          }
        : undefined;

      const newCoupon = await prisma.coupon.create({
        data: {
          code: newCouponData.code,
          discount: newCouponData.discount,
          discountType: newCouponData.type,
          validFrom: newCouponData.validFrom,
          validTo: newCouponData.validTo,
          maxUsesPerUser: newCouponData.maxUsesPerUser,
          maxUsesTotal: newCouponData.maxUsesTotal,
          PlanModel,
        },
      });
      res.status(200).json(newCoupon);
    } else if (method === 'PUT') {
    } else if (method === 'DELETE') {
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json(error);
  }
}
