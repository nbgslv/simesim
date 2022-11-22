import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const { phoneNumber, token, callbackUrl } = req.body;
      // const twilioApi = new TwilioApi(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!, process.env.TWILIO_VERIFY_SID!);
      // const verificationStatus = await twilioApi.validateVerificationCode(phoneNumber, token);
      const verificationStatus = true;
      if (verificationStatus) {
        await prisma.user.update({
          where: {
            email: phoneNumber,
          },
          data: {
            lastLogin: new Date(),
          },
        });
        res.redirect(
          302,
          `/api/auth/callback/email?email=${phoneNumber}&token=${token}&callbackUrl=${encodeURI(
            callbackUrl || 'http://localhost:3000'
          )}`
        );
      } else {
        res.redirect(302, '/error?error=Verification');
      }
    } else if (method === 'GET') {
      // Return Order by ID
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: unknown) {
    console.error(error);
    res.redirect(302, '/error?error=Verification');
  }
}
