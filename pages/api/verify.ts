import type { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';
import prisma from '../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      const { phoneNumber, token, callbackUrl } = req.body;
      const postSchema = yup.object({
        phoneNumber: yup.string().length(10).required(),
        token: yup.string().required(),
        callbackUrl: yup.string(),
      });
      await postSchema.validate({ phoneNumber, token, callbackUrl });
      // const twilioApi = new TwilioApi(
      //   process.env.TWILIO_ACCOUNT_SID!,
      //   process.env.TWILIO_AUTH_TOKEN!,
      //   process.env.TWILIO_VERIFY_SID!
      // );
      // const verificationStatus = await twilioApi.validateVerificationCode(
      //   phoneNumber
      // );
      // if (verificationStatus) {
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
            callbackUrl || 'https://simesim.co.il'
          )}`
        );
      // } else {
      //   res.redirect(302, '/error?error=Verification');
      // }
    } else {
      res.status(405).json({
        name: 'METHOD_NOT_ALLOWED',
        success: false,
        message: 'Method not allowed',
      });
    }
  } catch (error: unknown) {
    console.error(error);
    res.redirect(302, '/error?error=Verification');
  }
}
