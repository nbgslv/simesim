import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry } from '@prisma/client';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Partial<Inquiry> | Error>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const newInquiryData = req.body;

      const newInquiry = await prisma.inquiry.create({
        data: {
          name: newInquiryData.name,
          phone: newInquiryData.phone,
          email: newInquiryData.email,
          message: newInquiryData.message,
        },
      });

      res.status(200).json({ id: newInquiry.id });
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json(error as Error);
  }
}
