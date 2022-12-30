import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry, PaymentStatus } from '@prisma/client';
import { ApiResponse } from '../../../lib/types/api';
import Invoice4UClearing from '../../../utils/api/services/i4u/api';
import prisma from '../../../lib/prisma';

enum PaymentType {
  PAYPAL = 'PAYPAL',
  CREDIT_CARD = 'CREDIT_CARD',
  BIT = 'BIT',
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Inquiry>>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      // eslint-disable-next-line no-console
      console.log({ body: req.body });
    } else if (method === 'GET') {
      const { orderId, paymentType: paymentMethod } = req.query;

      const i4uPaymentApi = new Invoice4UClearing(
        process.env.INVOICE4U_API_KEY!,
        process.env.INVOICE4U_USER!,
        process.env.INVOICE4U_PASSWORD!,
        process.env.INVOICE4U_TEST === 'true'
      );

      const orderData = await prisma.plan.findUnique({
        where: {
          id: orderId as string,
        },
        include: {
          user: true,
          payment: true,
          planModel: true,
        },
      });

      if (!orderData) {
        throw new Error('Invalid order');
      }

      const paymentData = await i4uPaymentApi.createPaymentClearing({
        fullName: `${orderData.user.firstName} ${orderData.user.lastName}`,
        phone: orderData.user.email,
        email: orderData.user.emailEmail,
        sum: orderData.price,
        planId: orderData.id,
        items: [
          {
            name: orderData.planModel.name,
            quantity: 1,
            price: orderData.price.toString(),
            taxRate: '0',
          },
        ],
        isBitPayment: paymentMethod === PaymentType.BIT,
      });

      const clearingTraceId = paymentData.d.OpenInfo.find(
        (item) => item.Key === 'ClearingTraceId'
      )?.Value;
      const paymentId = paymentData.d.OpenInfo.find(
        (item) => item.Key === 'PaymentId'
      )?.Value;
      const clearingLogId = paymentData.d.OpenInfo.find(
        (item) => item.Key === 'I4UClearingLogId'
      )?.Value;

      if (
        !paymentData ||
        (paymentData.d.Errors && paymentData.d.Errors.length) ||
        !paymentData.d.ClearingRedirectUrl ||
        !clearingTraceId ||
        !paymentId ||
        !clearingLogId
      ) {
        await prisma.plan.update({
          where: {
            id: orderId as string,
          },
          data: {
            payment: {
              create: {
                amount: orderData.price,
                user: {
                  connect: {
                    id: orderData.userId,
                  },
                },
                status: PaymentStatus.FAILED,
              },
            },
          },
        });
        throw new Error('Error creating payment');
      }

      await prisma.plan.update({
        where: {
          id: orderId as string,
        },
        data: {
          payment: {
            create: {
              clearingTraceId,
              paymentId,
              i4UClearingLogId: clearingLogId,
              amount: orderData.price,
              user: {
                connect: {
                  id: orderData.userId,
                },
              },
              status: PaymentStatus.PENDING,
            },
          },
        },
      });

      res.redirect(
        302,
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/i4u?paymentUrl=${encodeURI(
          paymentData.d.ClearingRedirectUrl
        )}&total=${orderData.price}`
      );
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
