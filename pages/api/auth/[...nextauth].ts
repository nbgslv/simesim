import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import otpGenerator from 'otp-generator';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import TwilioApi, { Channel } from '../../../utils/api/services/twilio/twilio';

const twilioApi = new TwilioApi(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
  process.env.TWILIO_VERIFY_SID!
);

export const authOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions => ({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      name: 'Credentials',
      server: '',
      maxAge: 60 * 60 * 2, // 2 hours
      sendVerificationRequest: async ({ identifier: phone, token }) => {
        const { body } = req;
        let { method } = body;
        const { recaptchaToken } = body;

        const googleRecaptchaResponse = await fetch(
          `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET}&response=${recaptchaToken}`,
          {
            method: 'POST',
          }
        );
        const googleRecaptchaResponseData = await googleRecaptchaResponse.json();

        if (
          !googleRecaptchaResponseData.success ||
          googleRecaptchaResponseData.score < 0.5
        ) {
          throw new Error('Google reCAPTCHA verification failed');
        }

        if (method) {
          if (method === 'sms') {
            method = Channel.SMS;
          } else if (method === 'voice') {
            method = Channel.VOICE;
          } else if (method === 'whatsapp') {
            method = Channel.WHATSAPP;
          }
        } else {
          method = Channel.WHATSAPP;
        }
        const user = await prisma.user.findUnique({
          where: {
            email: phone,
          },
        });

        if (!user) {
          res.redirect('/error?error=Verification');
        } else {
          const message = await twilioApi.sendVerificationCode(
            phone,
            token,
            method
          );
          if (message !== 'pending') {
            res.redirect('/error?error=Configuration');
          }
        }
      },
      generateVerificationToken: async () =>
        otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        }),
      normalizeIdentifier: (identifier) => identifier,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 60 * 60 * 2, // 2 hours
  },
  callbacks: {
    async jwt({ token }) {
      const user = await prisma.user.findUnique({
        where: {
          email: token.email!,
        },
      });
      if (user) {
        /* eslint-disable no-param-reassign */
        token.name = `${user.firstName} ${user.lastName}`;
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        return session;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/verify',
    error: '/error',
  },
});

export default async function auth(req: any, res: any) {
  return NextAuth(req, res, {
    ...authOptions(req, res),
  });
}
