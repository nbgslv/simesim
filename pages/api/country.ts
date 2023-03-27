import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, Country } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { deleteSchema } from '../../utils/api/validation';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    ApiResponse<
      { countries: Partial<Country>[] } | Partial<Country> | Prisma.BatchPayload
    >
  >
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
                name: yup
                  .string()
                  .required()
                  .matches(/^[A-Za-z]+$/),
                translation: yup
                  .string()
                  .required()
                  .matches(/^[\u0590-\u05fe]+$/),
                lockTranslation: yup.boolean().required(),
                show: yup.boolean(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await postSchema.validate({ input });
      const country = await prisma.country.create({
        ...input,
      });
      res.status(200).json({ success: true, data: country });
    } else if (method === 'GET') {
      const countries: Partial<Country>[] = await prisma.country.findMany({
        where: {
          show: true,
        },
        select: {
          id: true,
          name: true,
          translation: true,
        },
      });
      res.status(200).json({ success: true, data: { countries } });
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
                name: yup.string().matches(/^[A-Za-z | \u0020-\u002F]+$/),
                translation: yup
                  .string()
                  .matches(/^[\u0590-\u05fe | \u0020-\u002F]+$/),
                lockTranslation: yup.boolean(),
                show: yup.boolean(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await putSchema.validate({ input });
      const update: Country = await prisma.country.update({
        ...input,
      });
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
        const deleteMany = await prisma.country.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteMany });
      } else if (action === 'delete') {
        const deleted = await prisma.country.delete({
          ...input,
        });
        res.status(200).json({ success: true, data: deleted });
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
      name: 'COUNTRY_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
