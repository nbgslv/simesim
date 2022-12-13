import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma, User } from '@prisma/client';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { Input } from '../../utils/api/services/adminApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>
) {
  try {
    const { method } = req;
    if (method === 'PUT') {
      const { ...query }: { query: Input<User, 'update'> } = req.body;
      const update: User = await prisma.user.update(({
        ...query,
      } as unknown) as Prisma.UserUpdateArgs);
      res.status(200).json({ success: true, data: update });
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
