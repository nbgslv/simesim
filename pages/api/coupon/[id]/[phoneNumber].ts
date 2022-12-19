import type { NextApiRequest, NextApiResponse } from 'next';
import { CouponUser, Coupon } from '@prisma/client';
import * as yup from 'yup';
import prisma from '../../../../lib/prisma';
import { ApiResponse } from '../../../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Partial<ApiResponse<Partial<Coupon>>>>
) {
  const {
    query: { id, phoneNumber },
    method,
  } = req;
  if (method === 'GET') {
    const getSchema = yup.object({
      id: yup.string().required(),
      phoneNumber: yup.string().length(10).required(),
    });
    await getSchema.validate({ id, phoneNumber });
    const existingUser = await prisma.user.findUnique({
      where: {
        email: phoneNumber as string,
      },
    });
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: id as string,
      },
      include: {
        users: true,
      },
    });
    if (
      coupon &&
      coupon.validFrom < new Date() &&
      coupon.validTo > new Date()
    ) {
      const userUsages = existingUser
        ? coupon.users.filter(
            (user: CouponUser) => user.userId === existingUser.id
          )
        : [];
      if (
        existingUser &&
        (coupon.maxUsesPerUser < userUsages.length + 1 ||
          (coupon.maxUsesTotal > 0 && coupon.maxUsesTotal <= coupon.uses + 1))
      ) {
        res.status(400).json({ success: false, message: 'הקופון אזל' });
      } else {
        res.status(200).json({
          success: true,
          data: {
            id: coupon.id,
            discountType: coupon.discountType,
            discount: coupon.discount,
          },
        });
      }
    } else if (
      coupon &&
      (coupon.validFrom > new Date() || coupon.validTo < new Date())
    ) {
      res.status(400).json({ success: false, message: 'פג תוקף' });
    } else {
      res.status(404).json({ success: false, message: 'הקופון לא קיים' });
    }
  } else {
    res.status(405).json({
      name: 'METHOD_NOT_ALLOWED',
      success: false,
      message: 'Method not allowed',
    });
  }
}
