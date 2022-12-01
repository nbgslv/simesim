import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry } from '@prisma/client';
import { ApiResponse } from '../../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Inquiry>>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      // eslint-disable-next-line no-console
      console.log({ body: req.body });
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
      name: 'PAYMENT_RECORDING_ERROR',
      success: false,
      message: (error as Error).message,
    });
  }
}
