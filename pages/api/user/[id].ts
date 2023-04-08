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
    if (method === 'POST') {
      if (!session) {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
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
      const changeDetails = await prisma.changeDetails.create({
        data: {
          user: {
            connect: {
              id: id as string,
            },
          },
          firstName,
          lastName,
          email,
          emailEmail,
        },
      });
      res.status(200).json({ success: true, data: { id: changeDetails.id } });
    } else if (method === 'PUT') {
      const { id, action } = req.query;

      if (action && action === 'finish') {
        const { firstName, lastName, email, phoneNumber } = req.body;
        const putSchema = yup.object().shape({
          firstName: yup.string().required(),
          lastName: yup.string().required(),
          email: yup.string().email().required(),
          phoneNumber: yup.string().length(10).required(),
        });
        await putSchema.validate({
          firstName,
          lastName,
          email,
          phoneNumber,
        });
        const updatedUser = await prisma.user.update({
          where: {
            id: id as string,
          },
          data: {
            firstName,
            lastName,
            email: phoneNumber,
            emailEmail: email,
          },
          select: {
            id: true,
          },
        });

        if (!updatedUser) {
          throw new Error('User not found');
        }

        res.status(200).json({ success: true, data: updatedUser });
      } else {
        const postSchema = yup.object({
          id: yup.string().required(),
        });
        await postSchema.validate({
          id,
        });
        const updateDetails = await prisma.changeDetails.findUnique({
          where: {
            id: id as string,
          },
        });
        if (!updateDetails) {
          res.status(404).json({
            name: 'NOT_FOUND',
            success: false,
            message: 'Not found',
          });
          return;
        }
        const [updatedUser] = await prisma.$transaction([
          prisma.user.update({
            where: {
              id: updateDetails.userId,
            },
            data: {
              firstName: updateDetails.firstName,
              lastName: updateDetails.lastName,
              email: updateDetails.email as string,
              emailEmail: updateDetails.emailEmail as string,
            },
          }),
          prisma.changeDetails.delete({
            where: {
              id: updateDetails.id as string,
            },
          }),
        ]);
        res.status(200).json({ success: true, data: updatedUser });
      }
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
