import type { NextApiRequest, NextApiResponse } from 'next';
import { Line } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Line>>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const { input } = req.body;
      const country = await prisma.country.create({
        ...input,
      });
      res.status(200).json({ success: true, data: country });
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
      name: 'LINE_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
