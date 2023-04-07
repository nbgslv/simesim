import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '../../../lib/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<null>>
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      // eslint-disable-next-line no-console
      console.log({ req });
      res.status(200);
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
      name: 'CONTACT_CREATION_ERR',
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
