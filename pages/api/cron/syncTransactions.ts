import { NextApiRequest, NextApiResponse } from 'next';
import { verifyApi } from '../../../utils/auth';
import { ApiResponse } from '../../../lib/types/api';
import syncTransactions from '../../../lib/cron/transactionsSync';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<null>>
) {
  try {
    if (req.method === 'POST') {
      const { authorization } = req.headers;
      if (!authorization) {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      if (!(await verifyApi(authorization))) {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      await syncTransactions();
      res.status(200).json({ success: true, data: null });
    } else {
      res.status(405).json({
        name: 'METHOD_NOT_ALLOWED',
        success: false,
        message: 'Method not allowed',
      });
    }
  } catch (error: Error | any) {
    console.error(error);
    res.status(500).json({
      name: 'CRON_TRANSACTIONS_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}
