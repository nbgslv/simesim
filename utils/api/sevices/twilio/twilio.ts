export enum Channel {
    SMS = 'sms',
    VOICE = 'call',
    WHATSAPP = 'whatsapp',
}

export default class TwilioApi {
    private readonly sdk: any;
    private readonly messagingServiceSid: string;

    constructor(accountSid: string, authToken: string, messagingServiceSid: string) {
        this.sdk = require('twilio')(accountSid, authToken);
        this.messagingServiceSid = messagingServiceSid;
    }

    formatPhoneNumber(phoneNumber: string) {
        return phoneNumber.replace('0', '+972');
    }

    async sendVerificationCode(phoneNumber: string, verificationCode: string) {
        const validPhoneNumber = this.formatPhoneNumber(phoneNumber);
        const { status } = await this.sdk.messages.create({
            body: `קוד האימות שלך הוא: ${verificationCode}`,
            messagingServiceSid: this.messagingServiceSid,
            to: validPhoneNumber
        });
        return status;
    }

    async sendVerificationCodeWithVerify(phoneNumber: string, verificationCode: string, channel: Channel) {
        const validPhoneNumber = this.formatPhoneNumber(phoneNumber);
        const verify = await this.sdk.verify.v2.services(this.messagingServiceSid)
            .verifications
            .create({
                to: validPhoneNumber,
                channel,
                customCode: verificationCode,
                locale: 'he'
            });
        console.log({ verify });
        return verify.status;
    }
}
