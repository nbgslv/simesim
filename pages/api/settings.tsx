import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, Settings } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { deleteSchema } from '../../utils/api/validation';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Settings | Settings[] | Prisma.BatchPayload>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'GET') {
      const settings = await prisma.settings.findMany();
      res.status(200).json({ success: true, data: settings });
    } else if (method === 'POST') {
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
        input: yup.object({
          data: yup.object({
            name: yup
              .string()
              .matches(/^[a-zA-Z0-9_]+$/, 'Name must be alphanumeric')
              .required('Name is required'),
            value: yup.string().required('Value is required'),
          }),
          include: yup.object(),
        }),
      });
      await postSchema.validate({ input });
      const newSetting = await prisma.settings.create({
        ...input,
        data: {
          ...input.data,
        },
      });
      res.status(201).json({ success: true, data: newSetting });
    } else if (method === 'PUT') {
      if (!session || session.user.role !== 'ADMIN') {
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
                name: yup
                  .string()
                  .matches(/^[a-zA-Z0-9_]+$/, 'Name must be alphanumeric'),
                value: yup.string(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await putSchema.validate({ input });
      const updatedSetting = await prisma.settings.update({
        ...input,
      });
      if (!updatedSetting) {
        throw new Error('Error updating setting');
      }
      res.status(200).json({ success: true, data: updatedSetting });
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
        const deletedSettings = await prisma.settings.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deletedSettings });
      } else if (action === 'delete') {
        const deletedSetting = await prisma.settings.delete({
          ...input,
        });
        res.status(200).json({ success: true, data: deletedSetting });
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
      name: 'SETTINGS_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
