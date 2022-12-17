import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, Country } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    ApiResponse<
      { countries: Partial<Country>[] } | Partial<Country> | Prisma.BatchPayload
    >
  >
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const { input } = req.body;
      const country = await prisma.country.create({
        ...input,
      });
      res.status(200).json({ success: true, data: country });
    } else if (method === 'GET') {
      const countries: Partial<Country>[] = await prisma.country.findMany({
        where: {
          show: true,
        },
        select: {
          name: true,
          translation: true,
        },
      });
      res.status(200).json({ success: true, data: { countries } });
    } else if (method === 'PUT') {
      const { input } = req.body;
      const update: Country = await prisma.country.update({
        ...input,
      });
      res.status(200).json({ success: true, data: update });
    } else if (method === 'DELETE') {
      const { action, input } = req.body;
      if (action === 'deleteMany') {
        const deleteMany = await prisma.country.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteMany });
      } else if (action === 'delete') {
        const deleted = await prisma.country.delete({
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
      name: 'COUNTRY_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
