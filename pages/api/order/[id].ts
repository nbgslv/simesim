import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../../lib/prisma';
import { ApiResponse } from '../../../lib/types/api';
import Invoice4UClearing from '../../../utils/api/services/i4u/api';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Plan>>>
) {
  try {
    const session = await unstable_getServerSession(
      req,
      res,
      authOptions(req, res)
    );
    const { method } = req;
    if (method === 'PUT') {
      const { id } = req.query;
      const plan = await prisma.plan.findUnique({
        where: {
          id: id as string,
        },
        include: {
          payment: true,
        },
      });
      if (!plan || !plan.payment) {
        throw new Error('No plan found');
      }
      const i4uApi = new Invoice4UClearing(
        process.env.INVOICE4U_API_KEY!,
        process.env.INVOICE4U_USER!,
        process.env.INVOICE4U_PASSWORD!,
        process.env.INVOICE4U_TEST === 'true'
      );
      if (!i4uApi.isVerified) {
        await i4uApi.verifyLogin();
      }
      const clearingLog = await i4uApi.getClearingLogByParams(
        plan.payment.paymentId as string
      );
      // eslint-disable-next-line no-console
      console.log({ clearingLog });
      if (!clearingLog) {
        throw new Error('No clearing log found');
      } else if (clearingLog.d.Errors && clearingLog.d.Errors.length > 0) {
        console.error(clearingLog.d.Errors);
        throw new Error(clearingLog.d.Errors.toString());
      }

      if (
        plan &&
        plan.userId === session?.user?.id &&
        plan.payment?.status !== 'PAID'
      ) {
        const paymentDate = new Date(
          Number(clearingLog.d.Date.match(/\d+/)?.[0])
        );
        const updatedPayment = await prisma.payment.update({
          where: {
            id: plan.paymentId as string,
          },
          data: {
            ClearingConfirmationNumber:
              clearingLog.d.ClearingConfirmationNumber,
            paymentDate,
            DocId: clearingLog.d.DocId,
            IsDocumentCreated: clearingLog.d.IsDocumentCreated,
            status: 'PAID',
            paymentMethod: {
              create: {
                IsBitPayment: clearingLog.d.IsBitPayment,
                cardType: clearingLog.d.CreditTypeName,
                last4: clearingLog.d.CreditNumber,
                user: {
                  connect: {
                    id: session?.user?.id,
                  },
                },
              },
            },
          },
        });
        if (updatedPayment) {
          res
            .status(200)
            .json({ success: true, data: { friendlyId: plan.friendlyId } });
        } else {
          throw new Error('Payment failed');
        }
      } else {
        res.status(403).json({
          name: 'ORDER_CREATION_ERR',
          message: 'Plan not found',
          success: false,
        });
      }
    } else {
      res.status(405).json({
        name: 'METHOD_NOT_ALLOWED',
        success: false,
        message: 'Method not allowed',
      });
    }
  } catch (e: unknown) {
    console.error(e);
    res.status(500).json({
      name: 'ORDER_UPDATE_ERR',
      message: 'Something went wrong',
      success: false,
    });
  }
}
