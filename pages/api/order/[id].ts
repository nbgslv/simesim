import type { NextApiRequest, NextApiResponse } from 'next';
import { Plan, Prisma } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Plan | { message: string }>
) {
  try {
    const session = await unstable_getServerSession(
      req,
      res,
      authOptions(req, res)
    );
    const {
      query: { id },
      method,
    } = req;
    if (method === 'GET') {
      // Return Order by ID
    } else if (method === 'PUT') {
      const updatedPlanData = req.body;
      let paymentMethod:
        | Prisma.PaymentMethodUpdateOneWithoutPaymentNestedInput
        | undefined;
      const plan = await prisma.plan.findUnique({
        where: {
          id: id as string,
        },
        include: {
          payment: true,
        },
      });
      if (
        plan &&
        plan.userId === session?.user?.id &&
        plan.payment?.status !== 'PAID'
      ) {
        if (updatedPlanData.payment.paymentMethod.token) {
          const existingPaymentMethod = await prisma.paymentMethod.findUnique({
            where: {
              token: updatedPlanData.payment.paymentMethod.token,
            },
          });
          if (existingPaymentMethod) {
            paymentMethod = {
              connect: {
                id: existingPaymentMethod.id,
              },
            };
          } else {
            paymentMethod = {
              create: {
                token: updatedPlanData.payment.paymentMethod.token,
                cardType: updatedPlanData.payment.paymentMethod.cardType,
                expMonth: updatedPlanData.payment.paymentMethod.expMonth,
                expYear: updatedPlanData.payment.paymentMethod.expYear,
                last4: updatedPlanData.payment.paymentMethod.last4,
                user: {
                  connect: {
                    id: session?.user?.id,
                  },
                },
              },
            };
          }
        } else {
          paymentMethod = {
            create: {
              token: updatedPlanData.payment.paymentMethod.token,
              cardType: updatedPlanData.payment.paymentMethod.cardType,
              expMonth: updatedPlanData.payment.paymentMethod.expMonth,
              expYear: updatedPlanData.payment.paymentMethod.expYear,
              last4: updatedPlanData.payment.paymentMethod.last4,
              user: {
                connect: {
                  id: session?.user?.id,
                },
              },
            },
          };
        }
        const updatedPlan = await prisma.plan.update({
          where: {
            id: id as string,
          },

          data: {
            payment: {
              update: {
                status: updatedPlanData.payment.status,
                invoice: updatedPlanData.invoice,
                paymentMethod: paymentMethod,
              },
            },
          },
        });
        res.status(200).json(updatedPlan);
      } else {
        res.status(403).json({ message: 'Plan not found' });
      }
    } else if (method === 'DELETE') {
      // Delete Draft Order
    }
  } catch (e: unknown) {
    console.error(e);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
