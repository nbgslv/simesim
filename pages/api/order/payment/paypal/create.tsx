import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import paypal, { Payment, SDKError } from 'paypal-rest-sdk';
import { ApiResponse } from '../../../../../lib/types/api';
import { authOptions } from '../../../auth/[...nextauth]';
import prisma from '../../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'POST') {
      if (!session) {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { orderId } = req.body;
      const plan = await prisma.plan.findUnique({
        where: {
          id: orderId,
        },
        include: {
          planModel: true,
          user: true,
        },
      });
      if (!plan) {
        throw new Error('Plan not found');
      }
      paypal.configure({
        mode: process.env.CUSTOM_ENV === 'production' ? 'live' : 'sandbox',
        client_id: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        client_secret: process.env.PAYPAL_CLIENT_SECRET!,
      });
      paypal.payment.create(
        {
          intent: 'sale',
          payer: {
            payment_method: 'paypal',
          },
          redirect_urls: {
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/payment/paypal/order/execute`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/payment/paypal/order/cancel`,
          },
          transactions: [
            {
              item_list: {
                items: [
                  {
                    price: plan.price.toString(),
                    name: plan.planModel.name,
                    currency: 'ILS',
                    quantity: 1,
                  },
                ],
              },
              amount: {
                currency: 'ILS',
                total: plan.price.toString(),
              },
              description: plan.planModel.description || 'כרטיס ה-eSim שלך',
            },
          ],
        },
        (error: SDKError, payment: Payment) => {
          if (error) {
            console.error(error);
            console.error(error.response.details);
            throw new Error(error.message);
          } else {
            res.status(200).json({
              success: true,
              data: {
                token: payment.links?.[1].href.match(/token=(.*)/i)?.[1],
              },
            });
          }
        }
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
      name: 'CONTACT_CREATION_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
