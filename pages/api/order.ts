import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { getFormData } from '../../utils/objects';

export enum OrderStatus {
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FINISHED = 'FINISHED',
  DRAFT = 'DRAFT',
}

export type Order = {
  id: string;
  externalId: string;
  simId: string;
  bundleId: string;
  status: OrderStatus;
  activatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Partial<Order>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const newOrderData = JSON.parse(req.body);

      const userExists = await prisma.user.findUnique({
        where: {
          email: newOrderData.phoneNumber,
        },
      });
      let user;
      if (!userExists) {
        const newUser = await prisma.user.create({
          data: {
            email: newOrderData.phoneNumber,
            emailEmail: newOrderData.email,
            firstName: newOrderData.firstName,
            lastName: newOrderData.lastName,
          },
        });
        user = newUser.id;
      } else {
        user = userExists.id;
      }

      const plan = await prisma.plan.create({
        data: {
          planModel: {
            connect: {
              id: newOrderData.planModel,
            },
          },
          price: newOrderData.price,
          user: {
            connect: {
              id: user,
            },
          },
          payment: {
            create: {
              externalId: Math.floor(
                Math.random() * (999 - 100) + 100
              ).toString(), // TODO: Get from payment gateway
              amount: newOrderData.price,
              status: 'PENDING',
              user: {
                connect: {
                  id: user,
                },
              },
            },
          },
          Bundle: {
            connect: {
              id: newOrderData.bundle,
            },
          },
          Refill: {
            connect: {
              id: newOrderData.refill,
            },
          },
        },
      });

      res.redirect(
        302,
        `http://localhost:3000/login?orderId=${plan.id}&phone=${newOrderData.phoneNumber}`
      );

      // console.log({headers: check.headers, status: check.status, body: await check.json()})

      // TODO: Create order in payment gateway
      // TODO: Add coupon registration

      // res.status(200).json(plan)
    } else if (method === 'PUT') {
    } else if (method === 'DELETE') {
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json(error);
  }
}
