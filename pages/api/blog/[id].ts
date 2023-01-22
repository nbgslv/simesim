import type { NextApiRequest, NextApiResponse } from 'next';
import { Post } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { ApiResponse } from '../../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Post>>>
) {
  try {
    const { method } = req;
    if (method === 'GET') {
      const { id } = req.query;
      const post = await prisma.post.findUnique({
        where: {
          id: id as string,
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      res.status(200).json({ success: true, data: post });
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
      name: 'POST_GET_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
