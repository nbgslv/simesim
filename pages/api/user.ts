import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, User } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import * as yup from 'yup';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';
import { deleteSchema } from '../../utils/api/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User | Prisma.BatchPayload>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'POST') {
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { input } = req.body;
      const postSchema = yup.object({
        input: yup
          .object({
            data: yup
              .object({
                email: yup
                  .string()
                  .length(10, 'Phone Number must be 10 characters')
                  .required('Phone Number required'),
                emailEmail: yup.string().email().required('Email required'),
                firstName: yup.string().required('First Name required'),
                lastName: yup.string().required('Last Name required'),
                role: yup
                  .string()
                  .oneOf(['ADMIN', 'USER'])
                  .required('Role required'),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await postSchema.validate({ input });
      const data = await prisma.user.create({
        ...input,
      });
      res.status(200).json({ success: true, data });
    } else if (method === 'PUT') {
      if (!session) {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const { input } = req.body;
      const putSchema = yup.object({
        input: yup
          .object({
            where: yup
              .object({
                id: yup.string().required(),
              })
              .required(),
            data: yup
              .object({
                email: yup
                  .string()
                  .length(10, 'Phone Number must be 10 characters'),
                emailEmail: yup.string().email(),
                firstName: yup.string(),
                lastName: yup.string(),
                role: yup.string().oneOf(['ADMIN', 'USER']),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await putSchema.validate({ input });
      const update: User = await prisma.user.update(({
        ...input,
      } as unknown) as Prisma.UserUpdateArgs);
      res.status(200).json({ success: true, data: update });
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
        const deleteMany = await prisma.user.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteMany });
      } else if (action === 'delete') {
        const deleteOne = await prisma.user.delete({
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
      name: 'USER_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
