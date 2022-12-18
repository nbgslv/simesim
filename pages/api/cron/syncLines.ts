import { NextApiRequest, NextApiResponse } from 'next';
import syncLines from '../../../lib/cron/linesSync';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // eslint-disable-next-line no-console
  console.log(req);
  if (req.method === 'POST') {
    try {
      // const { authorization } = req.headers;
      //
      // if (authorization === `Bearer ${process.env.API_SECRET_KEY}`) {
      await syncLines();
      res.status(200).json({ success: true });
      // } else {
      //     res.status(401).json({ success: false });
      // }
    } catch (err: Error | any) {
      console.error(err);
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
