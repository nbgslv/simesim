import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Inquiry>>>
) {
  try {
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

      const newInquiry = await prisma.inquiry.create({
        data: {
          name: newInquiryData.name,
          phone: newInquiryData.phone,
          email: newInquiryData.email,
          message: newInquiryData.message,
        },
      });

      res.status(201).json({ success: true, data: { id: newInquiry.id } });
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
