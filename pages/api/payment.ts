import type { NextApiRequest, NextApiResponse } from 'next';
import { Payment, Prisma } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import * as yup from 'yup';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';
import { deleteSchema } from '../../utils/api/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Payment>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'PUT') {
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { input } = req.body;

      const putSchema = yup.object({
        input: yup
          .object({
            where: yup
              .object({
                id: yup.string().required(),
              })
              .required(),
            data: yup
              .object({
                paymentMethod: yup
                  .object({
                    update: yup
                      .object({
                        isBitPayment: yup.boolean().required(),
                      })
                      .required(),
                  })
                  .required(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await putSchema.validate({ input });

      const update: Payment = await prisma.payment.update({
        ...input,
      });
      res.status(200).json({ success: true, data: update });
    } else if (method === 'DELETE') {
      const { input } = req.body;
      await deleteSchema.validate({ input });
      const deleted: Payment = await prisma.payment.delete(({
        ...input,
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
