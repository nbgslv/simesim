import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import * as yup from 'yup';
import prisma from '../../../lib/prisma';
import { ApiResponse } from '../../../lib/types/api';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<User>>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'PUT') {
      const { id } = req.query;
      const { firstName, lastName, email, emailEmail } = req.body;
      const postSchema = yup.object({
        id: yup.string().required(),
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        email: yup.string().length(10).required(),
        emailEmail: yup.string().email().required(),
      });
      await postSchema.validate({
        id,
        firstName,
        lastName,
        email,
        emailEmail,
      });
      if (!session || session.user.id !== id) {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      const user = await prisma.user.update({
        where: {
          id: id as string,
        },
        data: {
          firstName: firstName as string,
          lastName: lastName as string,
          email: email as string,
          emailEmail: emailEmail as string,
        },
      });
      res.status(200).json({ success: true, data: user });
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
