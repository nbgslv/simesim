import { NextApiRequest, NextApiResponse } from 'next';
import syncCountries from "../../../lib/cron/countriesSync";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === 'POST') {
        try {
            await syncCountries()
            res.status(200).json({ success: true });
        } catch (err: Error | any) {
            console.error(err)
            res.status(500).json({ statusCode: 500, message: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
