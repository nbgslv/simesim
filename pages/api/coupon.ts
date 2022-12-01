import type { NextApiRequest, NextApiResponse } from 'next';
import { Coupon } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Coupon>>>
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
      res.status(201).json({ success: true, data: { ...newCoupon } });
    } else {
      res
        .status(405)
        .json({
          name: 'METHOD_NOT_ALLOWED',
          success: false,
          message: 'Method not allowed',
        });
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({
      name: 'COUPON_CREATION_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
