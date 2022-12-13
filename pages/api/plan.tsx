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
      const {
        planModel,
        price,
        user,
        allowRefill,
        // eslint-disable-next-line
        createLine,
        // eslint-disable-next-line
        sendPayment,
        payment: paymentData,
      } = req.body;
      const payment =
        paymentData === 'none' ? undefined : { connect: { id: paymentData } };
      // TODO handle send payment
      // TODO handle create line
      const existingPlanModel = await prisma.planModel.findUnique({
        where: {
          id: planModel,
        },
      });
      if (!existingPlanModel) {
        throw new Error('Plan Model not found');
      }

      const newPlan = await prisma.plan.create({
        // @ts-ignore
        data: {
          planModel,
          price,
          status: 'ACTIVE',
          user: {
            connect: {
              id: user,
            },
          },
          allowRefill,
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
      res.status(201).json({ success: true, data: { ...newPlan } });
    } else if (method === 'PUT') {
      const { id, ...data } = req.body;
      console.log({ data });
      const payment = Object.keys(data).includes('payment') && {
        connect: {
          id: data.payment,
        },
      };
      if (payment) {
        data.payment = payment;
      }
      const user = Object.keys(data).includes('user') && {
        connect: {
          id: data.user,
        },
      };
      if (user) {
        data.user = user;
      }
      const line = Object.keys(data).includes('line') && {
        connect: {
          id: data.line,
        },
      };
      if (line) {
        data.line = line;
      }
      const bundle = Object.keys(data).includes('bundle') && {
        connect: {
          id: data.bundle,
        },
      };
      if (bundle) {
        data.bundle = bundle;
      }

      const updatedPlan = await prisma.plan.update({
        where: {
          id,
        },
        data: {
          ...data,
        },
        include: {
          planModel: {
            include: {
              bundle: true,
              refill: true,
            },
          },
          user: true,
          payment: {
            include: {
              paymentMethod: true,
            },
          },
          line: true,
          bundle: {
            include: {
              refills: true,
            },
          },
        },
      });
      if (!updatedPlan) {
        throw new Error('Error updating plan');
      }
      res.status(200).json({ success: true, data: { ...updatedPlan } });
    } else if (method === 'DELETE') {
      const { ids } = req.body;
      const deleteCount = await prisma.plan.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      res.status(200).json({ success: true, data: { ...deleteCount } });
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
