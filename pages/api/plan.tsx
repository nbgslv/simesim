import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan, Prisma } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { deleteSchema } from '../../utils/api/validation';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Plan | Prisma.BatchPayload>>
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
        input: yup.object({
          data: yup.object({
            planModel: yup
              .string()
              .required('Plan model is required')
              .test(
                'planModel',
                'Plan model is required',
                (value) => value !== 'none'
              ),
            price: yup
              .number()
              .required('Price is required')
              .min(0, 'Price must be greater than 0'),
            user: yup
              .string()
              .required('User is required')
              .test('user', 'User is required', (value) => value !== 'none'),
            allowRefill: yup.boolean().required('Allow refill is required'),
            createLine: yup.boolean().required('Create line is required'),
            payment: yup.string(),
            sendPayment: yup
              .boolean()
              .required('Send payment is required')
              .test(
                'payment',
                "Can't send payment with a payment chosen",
                (value) =>
                  ((yup.ref('payment') as unknown) as string) === 'none' ||
                  !value
              ),
          }),
          include: yup.object(),
        }),
      });
      await postSchema.validate({ input });
      const payment =
        input.data.paymentData === 'none'
          ? undefined
          : { connect: { id: input.data.paymentData } };
      // TODO handle send payment
      // TODO handle create line
      const existingPlanModel = await prisma.planModel.findUnique({
        where: {
          id: input.data.planModel,
        },
      });
      if (!existingPlanModel) {
        throw new Error('Plan Model not found');
      }

      const newPlan = await prisma.plan.create({
        ...input,
        data: {
          ...input.data,
          status: 'ACTIVE',
          user: {
            connect: {
              id: input.data.user,
            },
          },
          payment,
          bundle: {
            connect: {
              id: existingPlanModel.bundleId,
            },
          },
          refill: {
            connect: {
              id: existingPlanModel.refillId,
            },
          },
        },
      });
      res.status(201).json({ success: true, data: newPlan });
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
      const payment = Object.keys(input.data).includes('payment') && {
        connect: {
          id: input.data.payment,
        },
      };
      if (payment) {
        input.data.payment = payment;
      }
      const user = Object.keys(input.data).includes('user') && {
        connect: {
          id: input.data.user,
        },
      };
      if (user) {
        input.data.user = user;
      }
      const line = Object.keys(input.data).includes('line') && {
        connect: {
          id: input.data.line,
        },
      };
      if (line) {
        input.data.line = line;
      }
      const bundle = Object.keys(input.data).includes('bundle') && {
        connect: {
          id: input.data.bundle,
        },
      };
      if (bundle) {
        input.data.bundle = bundle;
      }

      const updatedPlan = await prisma.plan.update({
        ...input,
      });
      if (!updatedPlan) {
        throw new Error('Error updating plan');
      }
      res.status(200).json({ success: true, data: updatedPlan });
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
        const deletedPlans = await prisma.plan.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deletedPlans });
      } else if (action === 'delete') {
        const deletedPlan = await prisma.plan.delete({
          ...input,
        });
        res.status(200).json({ success: true, data: deletedPlan });
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
      name: 'PLAN_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
