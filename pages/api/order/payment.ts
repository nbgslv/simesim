import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry } from '@prisma/client';
import { ApiResponse } from '../../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Inquiry>>>
) {
  try {
    const { method } = req;
    // eslint-disable-next-line no-console
    console.log({ req, body: req.body });
    if (method === 'POST') {
      // eslint-disable-next-line no-console
      console.log({ method, body: req.body });
    } else if (method === 'GET') {
      // eslint-disable-next-line no-console
      console.log({ method, query: req.query });
    } else if (method === 'PUT') {
      // eslint-disable-next-line no-console
      console.log({ method, body: req.body });
    } else if (method === 'DELETE') {
      // eslint-disable-next-line no-console
      console.log({ method, body: req.body });
    } else {
      // eslint-disable-next-line no-console
      console.log({ method, body: req.body });
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
