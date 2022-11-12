import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prisma";
import TwilioApi, {Channel} from "../../../utils/api/sevices/twilio/twilio";
import otpGenerator from "otp-generator";

export default async function auth(req: any, res: any) {
    const twilioApi = new TwilioApi(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!, process.env.TWILIO_VERIFY_SID!);
    return await NextAuth(req, res, {
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            name: 'Credentials',
            server: '',
            maxAge: 60 * 60 * 2, // 2 hours
            sendVerificationRequest: async ({ identifier: phone, token, url }) => {
                console.log({ token })
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
                        phone
                    }
                })

                if (!user) {
                    // res.redirect('error?error=invalid_phone')
                } else {
                    // const message = await twilioApi.sendVerificationCodeWithVerify(phone, token, method);
                    // if (message !== 'pending') {
                    //     res.redirect('api/auth/error?error=general_error')
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
    callbacks: {
        async jwt({ token, account, profile }) {
            const user = await prisma.user.findUnique({
                where: {
                    email: account?.providerAccountId
                }
            })
            if (account && user) {
                token.name = `${user.firstName} ${user.lastName}`;
                token.rolw = user.role;
            }
            return token
        }
    },
    pages: {
        signIn: '/login',
        verifyRequest: '/verify',
        error: '/error'
    }
})

}
