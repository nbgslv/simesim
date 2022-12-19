import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry, Prisma } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';
import { deleteSchema } from '../../utils/api/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Inquiry> | Prisma.BatchPayload>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'POST') {
      const newInquiryData = req.body;

      const googleRecaptchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET}&response=${newInquiryData.recaptchaToken}`,
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
        name: yup.string(),
        phone: yup.string().test('phone-optional', '', (phone) => {
          if (phone) {
            return phone.length === 10;
          }
          return true;
        }),
        email: yup.string().email().required(),
        message: yup.string().required(),
      });
      await postSchema.validate(newInquiryData);

      const newInquiry = await prisma.inquiry.create({
        data: {
          name: newInquiryData.name,
          phone: newInquiryData.phone,
          email: newInquiryData.email,
          message: newInquiryData.message,
        },
      });

      res.status(201).json({ success: true, data: { id: newInquiry.id } });
    } else if (method === 'DELETE') {
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { action, input } = req.body;
      await deleteSchema.validate({ action, input });
      if (action === 'deleteMany') {
        const deleteMany = await prisma.inquiry.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteMany });
      } else if (action === 'delete') {
        const deleteOne = await prisma.inquiry.delete({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteOne });
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
      name: 'CONTACT_CREATION_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
