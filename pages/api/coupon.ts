import type { NextApiRequest, NextApiResponse } from 'next';
import { Coupon, Prisma } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import * as yup from 'yup';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';
import { deleteSchema } from '../../utils/api/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Coupon> | Prisma.BatchPayload>>
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
                planModels: yup.array().of(
                  yup.object({
                    value: yup.string().required('Plan model is required'),
                    label: yup.string().required('Plan model is required'),
                  })
                ),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await postSchema.validate({ input });
      const planModels = input.data.planModels.length
        ? {
            connect: input.data.planModels.map(
              (planModel: { value: string; label: string }) => ({
                id: planModel.value,
              })
            ),
          }
        : undefined;

      const newCoupon = await prisma.coupon.create({
        ...input,
        data: {
          ...input.data,
          planModels,
        },
      });
      res.status(201).json({ success: true, data: newCoupon });
    } else if (method === 'PUT') {
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { input } = req.body;
      const coupon = await prisma.coupon.findUnique({
        where: { id: input.where.id },
        include: { planModels: { select: { id: true } } },
      });
      if (!coupon) {
        res.status(404).json({
          name: 'NOT_FOUND',
          success: false,
          message: 'Coupon not found',
        });
        return;
      }

      let update = {};
      if (input.data.planModels) {
        update = await prisma.coupon.update({
          ...input,
          data: {
            planModels: {
              set: input.data.planModels.map(
                (planModel: { value: string; label: string }) => ({
                  id: planModel.value,
                })
              ),
            },
          },
        });
        delete input.data.planModels;
      }
      update = await prisma.coupon.update({
        ...input,
        data: {
          ...input.data,
        },
      });

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
