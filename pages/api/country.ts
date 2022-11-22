import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { Prisma, Country } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Prisma.CountrySelect | unknown>
) {
  try {
    const { method } = req;
    if (method === 'GET') {
      const countries: Partial<Country>[] = await prisma.country.findMany({
        where: {
          show: true,
        },
        select: {
          name: true,
          translation: true,
        },
      });
      res.status(200).json(countries);
    } else if (method === 'PUT') {
      const {
        body: { id, translation, lockTranslation, show },
        method,
      } = req;
      const update: Country = await prisma.country.update({
        where: {
          id,
        },
        data: {
          translation,
          lockTranslation,
          show,
        },
      });
      res.status(200).json(update);
    } else if (method === 'DELETE') {
      const {
        body: { id },
      } = req;
      if (!id) {
        throw new Error('No ID provided');
      }
      const deleted: Prisma.BatchPayload = await prisma.country.deleteMany({
        where: {
          id: {
            in: id,
          },
        },
      });
      res.status(200).json(deleted);
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json(error);
  }
}
