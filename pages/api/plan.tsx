import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Plan | Prisma.BatchPayload>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const { input } = req.body;
      const payment =
        input.data.pdaymentData === 'none'
          ? undefined
          : { connect: { id: input.data.pdaymentData } };
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
      const { action, input } = req.body;
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
