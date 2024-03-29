import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import otpGenerator from 'otp-generator';
import { NextApiRequest, NextApiResponse } from 'next';
import { JWT } from 'next-auth/jwt';
import prisma from '../../../lib/prisma';
import TwilioApi, { Channel } from '../../../utils/api/services/twilio/twilio';
// @ts-ignore
import { Session } from '../../../types/next-auth';

const twilioApi = new TwilioApi(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
  process.env.TWILIO_VERIFY_SID!
);

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith('https://');
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const hostName = new URL(process.env.NEXTAUTH_URL || '').hostname.replace(
  'www.',
  ''
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

        // TODO handle other way with errors, not with redirect
        if (!user) {
          res.redirect('/error?error=Verification');
          return;
        }
        if (process.env.CUSTOM_ENV === 'production') {
          const message = await twilioApi.sendVerificationCode(
            phone,
            token,
            method
          );
          if (message !== 'pending') {
            res.redirect('/error?error=Configuration');
          }
        } else {
          // eslint-disable-next-line no-console
          console.log({ token });
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
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: hostName === 'localhost' ? hostName : `.${hostName}`,
        secure: useSecureCookies,
      },
    },
  },
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
        token.emailEmail = user.emailEmail;
      }
      return token;
    },
    async session({
      session: userSession,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      if (userSession && userSession.user) {
        userSession.user.id = token.id as string;
        userSession.user.role = token.role as string;
        userSession.user.emailEmail = token.emailEmail as string;
        return userSession;
      }
      return userSession;
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
