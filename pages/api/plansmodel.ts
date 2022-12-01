import type { NextApiRequest, NextApiResponse } from 'next';
import { PlanModel } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<PlanModel>>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const {
        bundleId,
        refillId,
        name,
        description,
        price,
        vat,
        couponsIds,
      } = req.body;
      const couponsRecord =
        couponsIds !== 'none' ? { connect: couponsIds } : undefined;
      const planModel = await prisma.planModel.create({
        data: {
          bundle: {
            connect: {
              id: bundleId,
            },
          },
          refill: {
            connect: {
              id: refillId,
            },
          },
          name,
          description,
          price,
          vat,
          coupons: couponsRecord,
        },
      });
      res.status(201).json({ success: true, data: { ...planModel } });
    } else if (method === 'PUT') {
      const { id, ...planModel } = req.body;
      const updatedPlansModel = await prisma.planModel.update({
        where: { id },
        data: planModel,
      });
      res.status(200).json({ success: true, data: { ...updatedPlansModel } });
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
    res
      .status(500)
      .json({
        name: 'PLANMODEL_API_ERR',
        success: false,
        message: (error as Error).message,
      });
  }
}
