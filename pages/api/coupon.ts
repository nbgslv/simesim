import type { NextApiRequest, NextApiResponse } from 'next';
import { Coupon, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Coupon> | Prisma.BatchPayload>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const { input } = req.body;

      const planModel = input.data.planModel
        ? {
            connect: {
              id: input.data.planModel,
            },
          }
        : undefined;

      const newCoupon = await prisma.coupon.create({
        ...input,
        data: {
          ...input.data,
          planModel,
        },
      });
      res.status(201).json({ success: true, data: newCoupon });
    } else if (method === 'PUT') {
      const { input } = req.body;
      const update = await prisma.coupon.update({
        ...input,
      });
      res.status(200).json({ success: true, data: update });
    } else if (method === 'DELETE') {
      const { action, input } = req.body;
      if (action === 'deleteMany') {
        const deleteMany = await prisma.coupon.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteMany });
      } else if (action === 'delete') {
        const deleted = await prisma.coupon.delete({
          ...input,
        });
        res.status(200).json({ success: true, data: deleted });
      }
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
      name: 'COUPON_CREATION_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
