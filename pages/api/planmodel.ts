import type { NextApiRequest, NextApiResponse } from 'next';
import { PlanModel, Prisma } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import * as yup from 'yup';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { Input } from '../../utils/api/services/adminApi';
import { authOptions } from './auth/[...nextauth]';
import { deleteSchema } from '../../utils/api/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<PlanModel | Prisma.BatchPayload>>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'POST') {
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { input } = req.body;
      const postSchema = yup.object({
        input: yup
          .object({
            data: yup
              .object({
                code: yup.string().required('Code is required'),
                discount: yup
                  .number()
                  .required('Discount is required')
                  .min(0, 'Discount must be greater than 0'),
                discountType: yup
                  .mixed()
                  .oneOf(['PERCENT', 'AMOUNT'])
                  .required('Type is required'),
                validFrom: yup
                  .date()
                  .required('Valid from is required')
                  .nullable(true),
                validTo: yup
                  .date()
                  .required('Valid from is required')
                  .nullable(true),
                maxUsesPerUser: yup
                  .number()
                  .required('Max uses per user is required')
                  .min(1, 'Max uses per user must be greater than 0'),
                maxUsesTotal: yup
                  .number()
                  .required('Max uses total is required')
                  .min(-1, 'Max uses total must be greater than 0'),
                planModel: yup.string(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await postSchema.validate({ input });
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
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { input }: { input: Input<PlanModel, 'update'> } = req.body;
      const putSchema = yup.object({
        input: yup
          .object({
            where: yup
              .object({
                id: yup.string().required(),
              })
              .required(),
            data: yup
              .object({
                code: yup.string().required('Code is required'),
                discount: yup
                  .number()
                  .required('Discount is required')
                  .min(0, 'Discount must be greater than 0'),
                discountType: yup
                  .mixed()
                  .oneOf(['PERCENT', 'AMOUNT'])
                  .required('Type is required'),
                validFrom: yup
                  .date()
                  .required('Valid from is required')
                  .nullable(true),
                validTo: yup
                  .date()
                  .required('Valid from is required')
                  .nullable(true),
                maxUsesPerUser: yup
                  .number()
                  .required('Max uses per user is required')
                  .min(1, 'Max uses per user must be greater than 0'),
                maxUsesTotal: yup
                  .number()
                  .required('Max uses total is required')
                  .min(-1, 'Max uses total must be greater than 0'),
                planModel: yup.string(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await putSchema.validate({ input });
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
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { action, input } = req.body;
      await deleteSchema.validate({ action, input });
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
