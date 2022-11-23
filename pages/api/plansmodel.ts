import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Prisma.CountrySelect | unknown>
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
      const couponsRecord = couponsIds ? { connect: couponsIds } : undefined;
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
      res.status(200).json(planModel);
    } else if (method === 'GET') {
      // Return Order by ID
    } else if (method === 'PUT') {
      const { id, ...planModel } = req.body;
      const updatedPlansModel = await prisma.planModel.update({
        where: { id },
        data: planModel,
      });
      res.status(200).json(updatedPlansModel);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json(error);
  }
}
