import type { NextApiRequest, NextApiResponse } from 'next';
import { Line } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Line>>>
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
      // TODO add line
      // TODO add validation
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
