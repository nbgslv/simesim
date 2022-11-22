import type { NextApiRequest, NextApiResponse } from 'next';
import { CouponUser } from '@prisma/client';
import prisma from '../../../../lib/prisma';
import { Coupon } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Partial<Coupon | { message: string }>>
) {
  const {
    query: { id, phoneNumber },
    method,
  } = req;
  if (method === 'GET') {
    const user = await prisma.user.findUnique({
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
      const userUsages = user
        ? coupon.users.filter((user: CouponUser) => user.userId === user.id)
        : [];
      console.log({
        maxUsesPerUser: coupon.maxUsesPerUser <= userUsages.length + 1,
        userUsages:
          coupon.maxUsesTotal > 0 && coupon.maxUsesTotal <= coupon.uses + 1,
      });
      if (
        user &&
        (coupon.maxUsesPerUser < userUsages.length + 1 ||
          (coupon.maxUsesTotal > 0 && coupon.maxUsesTotal <= coupon.uses + 1))
      ) {
        res.status(400).json({ message: 'הקופון אזל' });
      } else {
        res.status(200).json(coupon);
      }
    } else if (
      coupon &&
      (coupon.validFrom > new Date() || coupon.validTo < new Date())
    ) {
      res.status(400).json({ message: 'פג תוקף' });
    } else {
      res.status(404).json({ message: 'הקופון לא קיים' });
    }
  } else if (method === 'PUT') {
    // Update Draft Order
  } else if (method === 'DELETE') {
    // Delete Draft Order
  }
}
