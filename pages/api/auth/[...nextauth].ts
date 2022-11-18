import NextAuth, {NextAuthOptions} from "next-auth"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import TwilioApi, {Channel} from "../../../utils/api/sevices/twilio/twilio";
import otpGenerator from "otp-generator";
import {NextApiRequest, NextApiResponse} from "next";

const twilioApi = new TwilioApi(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!, process.env.TWILIO_VERIFY_SID!);

export const authOptions = (req: NextApiRequest, res: NextApiResponse): NextAuthOptions => ({
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            name: 'Credentials',
            server: '',
            maxAge: 60 * 60 * 2, // 2 hours
            sendVerificationRequest: async ({ identifier: phone, token, url }) => {
                console.log({token})
                const body = req.body;
                let method = body.method;
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
                        email: phone
                    }
                })

                if (!user) {
                    res.redirect('/error?error=Verification')
                } else {
                    // const message = await twilioApi.sendVerificationCode(phone, token, method);
                    // if (message !== 'pending') {
                    //     res.redirect('/error?error=Configuration')
                    // }
                }
            },
            generateVerificationToken: async () => {
                return otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    specialChars: false,
                    lowerCaseAlphabets: false
                });
            },
            normalizeIdentifier: (identifier) => {
                return identifier;
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    jwt: {
        maxAge: 60 * 60 * 2, // 2 hours
    },
    callbacks: {
        async jwt({token}) {
            const user = await prisma.user.findUnique({
                where: {
                    email: token.email!
                }
            })
            if (user) {
                token.name = `${user.firstName} ${user.lastName}`;
                token.role = user.role;
                token.id = user.id;
            }
            return token
        },
        async session({ session, token, user }) {
            if (session && session.user) {
                session.user.id = token.id;
                return session;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        verifyRequest: '/verify',
        error: '/error'
    }
})

export default async function auth(req: any, res: any) {
    return await NextAuth(req, res, {
        ...authOptions(req, res)
    })
}
