import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, SupportedPhones } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { deleteSchema } from '../../utils/api/validation';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    ApiResponse<Partial<SupportedPhones> | Prisma.BatchPayload>
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
                phoneModel: yup
                  .string()
                  .required('Name is required')
                  .matches(
                    /^[A-Za-z\s0-9]+$/,
                    'Name must be only english letters'
                  ),
                brandId: yup
                  .string()
                  .not(['none'], 'Brand is required')
                  .when(['newBrand'], (newBrand, subSchema) =>
                    newBrand
                      ? subSchema
                      : subSchema.required('Brand is required')
                  ),
                newBrand: yup.string(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await postSchema.validate({ input });
      let brand;
      if (input.data.newBrand) {
        brand = {
          create: {
            name: input.data.newBrand,
          },
        };
        delete input.data.brandId;
        delete input.data.newBrand;
      } else if (input.data.brandId) {
        brand = {
          connect: {
            id: input.data.brandId,
          },
        };
        delete input.data.brandId;
        delete input.data.newBrand;
      }
      const supportedPhone = await prisma.supportedPhones.create({
        ...input,
        data: {
          ...input.data,
          brand,
        },
      });
      res.status(200).json({ success: true, data: supportedPhone });
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
                phoneModel: yup
                  .string()
                  .matches(
                    /^[A-Za-z\s0-9]+$/,
                    'Name must be only english letters'
                  ),
                brandId: yup
                  .string()
                  .not(['none'], 'Brand is required')
                  .when(['newBrand'], (newBrand, subSchema) =>
                    newBrand
                      ? subSchema
                      : subSchema.required('Brand is required')
                  ),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      await putSchema.validate({ input });
      let brand;
      if (input.data.brandId) {
        brand = {
          connect: {
            id: input.data.brandId,
          },
        };
        delete input.data.brandId;
      }
      const update: SupportedPhones = await prisma.supportedPhones.update({
        ...input,
        data: {
          ...input.data,
          brand,
        },
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
        const deleteMany = await prisma.supportedPhones.deleteMany({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteMany });
      } else if (action === 'delete') {
        const deleted = await prisma.supportedPhones.delete({
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
      name: 'SUPPORTED_PHONE_API_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
