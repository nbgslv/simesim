import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { Plan } from '@prisma/client';
import * as yup from 'yup';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import Invoice4UClearing from '../../utils/api/services/i4u/api';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Plan>>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'POST') {
      const newOrderData = JSON.parse(req.body);

      const googleRecaptchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET}&response=${newOrderData.recaptchaToken}`,
        {
          method: 'POST',
        }
      );
      const googleRecaptchaResponseData = await googleRecaptchaResponse.json();
      if (
        !googleRecaptchaResponseData.success ||
        googleRecaptchaResponseData.score < 0.5
      ) {
        throw new Error('Google reCAPTCHA verification failed');
      }

      const postSchema = yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        email: yup.string().email().required(),
        phoneNumber: yup.string().length(10).required(),
        price: yup.number().min(0).required(),
        recaptchaToken: yup.string().required(),
        coupon: yup.string(),
        planModel: yup.string(),
      });
      await postSchema.validate(newOrderData);

      // Check if user exists; if not, create user
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

      if (!user) {
        throw new Error('No user for order');
      }

      // Get planModel data for plan connections
      const planModel = await prisma.planModel.findUnique({
        where: {
          id: newOrderData.planModel,
        },
      });

      if (!planModel) {
        throw new Error('Invalid plan model');
      }

      let { price } = planModel;
      if (newOrderData.coupon) {
        const coupon = await prisma.coupon.findUnique({
          where: {
            id: newOrderData.coupon,
          },
        });
        if (coupon) {
          if (coupon.discountType === 'PERCENT') {
            price -= (price * coupon.discount) / 100;
          } else if (coupon.discountType === 'AMOUNT') {
            price -= coupon.discount;
          }
        }
      }

      const couponData = newOrderData.coupon
        ? { connect: { id: newOrderData.coupon } }
        : undefined;

      // Create order with pending payment(plan)
      const plan = await prisma.plan.create({
        data: {
          status: 'ACTIVE',
          planModel: {
            connect: {
              id: newOrderData.planModel,
            },
          },
          price,
          user: {
            connect: {
              id: user,
            },
          },
          payment: {
            create: {
              amount: price,
              status: 'PENDING',
              coupon: couponData,
              user: {
                connect: {
                  id: user,
                },
              },
            },
          },
          bundle: {
            connect: {
              id: planModel.bundleId,
            },
          },
          refill: {
            connect: {
              id: planModel.refillId,
            },
          },
        },
      });

      if (!plan) {
        throw new Error('Error creating plan');
      }

      const i4uPaymentApi = new Invoice4UClearing(
        process.env.INVOICE4U_API_KEY!,
        process.env.INVOICE4U_USER!,
        process.env.INVOICE4U_PASSWORD!,
        process.env.INVOICE4U_TEST === 'true'
      );

      const paymentData = await i4uPaymentApi.createPaymentClearing({
        fullName: `${newOrderData.firstName} ${newOrderData.lastName}`,
        phone: newOrderData.phoneNumber,
        email: newOrderData.email,
        sum: price,
        planId: plan.id,
        items: [
          {
            name: planModel.name,
            quantity: 1,
            price: price.toString(),
            taxRate: '0',
          },
        ],
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
        await prisma.payment.update({
          where: {
            id: plan.paymentId || undefined,
          },
          data: {
            status: 'FAILED',
          },
        });
        throw new Error('Error creating payment');
      }

      await prisma.payment.update({
        where: {
          id: plan.paymentId || undefined,
        },
        data: {
          clearingTraceId,
          paymentId,
          i4UClearingLogId: clearingLogId,
        },
      });

      // Check if user logged in/redirect to login
      if (!session) {
        res.redirect(
          302,
          `${process.env.NEXT_PUBLIC_BASE_URL}/login?phone=${
            newOrderData.phoneNumber
          }&paymentUrl=${encodeURI(
            paymentData.d.ClearingRedirectUrl
          )}&total=${price}`
        );
      } else {
        res.redirect(
          302,
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/order/payment?paymentUrl=${encodeURI(
            paymentData.d.ClearingRedirectUrl
          )}&total=${price}`
        );
      }
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
      name: 'ORDER_CREATION_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
