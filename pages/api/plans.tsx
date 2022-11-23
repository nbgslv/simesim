import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Plan | Prisma.BatchPayload | Error>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      // TODO refactor after adding a form to add plans
      // const newPlan = await prisma.plan.create({
      //   data: {
      //     price: 0,
      //   },
      // });
      // res.status(200).json(newPlan);
    } else if (method === 'GET') {
      // Return Order by ID
    } else if (method === 'PUT') {
      // Update Order
    } else if (method === 'DELETE') {
      const { ids } = req.body;
      const deleteCount = await prisma.plan.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      res.status(200).json(deleteCount);
    } else {
      res.status(405).json({ message: 'Method not allowed' } as Error);
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json(error as Error);
  }
}
