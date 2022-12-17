import type { NextApiRequest, NextApiResponse } from 'next';
import { PlanModel, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { Input } from '../../utils/api/services/adminApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<PlanModel | Prisma.BatchPayload>>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const { input } = req.body;
      const couponsRecord =
        input.data.couponsIds !== 'none'
          ? { connect: input.data.couponsIds }
          : undefined;
      const planModel = await prisma.planModel.create({
        ...input,
        data: {
          ...input.data,
          coupons: couponsRecord,
        },
      });
      res.status(201).json({ success: true, data: planModel });
    } else if (method === 'PUT') {
      const { input }: { input: Input<PlanModel, 'update'> } = req.body;
      const refill = Object.keys(input.data).includes('refill') && {
        connect: {
          id: input.data.refill,
        },
      };
      if (refill) {
        input.data.refill = refill as Prisma.RefillUpdateOneRequiredWithoutPlanModelNestedInput;
      }

      const bundle = Object.keys(input.data).includes('bundle') && {
        connect: {
          id: input.data.bundle,
        },
      };
      if (bundle) {
        input.data.bundle = bundle as Prisma.BundleUpdateOneRequiredWithoutPlanModelNestedInput;
      }
      const update: PlanModel = await prisma.planModel.update(({
        ...input,
      } as unknown) as Prisma.PlanModelUpdateArgs);
      res.status(200).json({ success: true, data: update });
    } else if (method === 'DELETE') {
      const { action, input } = req.body;
      if (action === 'deleteMany') {
        const deleteMany: Prisma.BatchPayload = await prisma.planModel.deleteMany(
          {
            ...input,
          }
        );
        res.status(200).json({ success: true, data: deleteMany });
      } else if (action === 'delete') {
        const deleteOne: PlanModel = await prisma.planModel.delete({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteOne });
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
      name: 'PLANMODEL_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
