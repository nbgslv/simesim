import type { NextApiRequest, NextApiResponse } from 'next';
import { Payment, Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { Input } from '../../utils/api/services/adminApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Payment>>
) {
  try {
    const { method } = req;
    if (method === 'PUT') {
      const { ...query }: { query: Input<Payment, 'update'> } = req.body;
      const update: Payment = await prisma.payment.update(({
        ...query,
      } as unknown) as Prisma.PaymentUpdateArgs);
      res.status(200).json({ success: true, data: update });
    } else if (method === 'DELETE') {
      const { ...query }: { query: Input<Payment, 'delete'> } = req.body;
      const deleted: Payment = await prisma.payment.delete(({
        ...query,
      } as unknown) as Prisma.PaymentDeleteArgs);
      res.status(200).json({ success: true, data: deleted });
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
      name: 'PAYMENT_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
