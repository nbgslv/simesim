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

    async sendVerificationCode(phoneNumber: string, verificationCode: string, channel: Channel) {
        try {
            const validPhoneNumber = this.formatPhoneNumber(phoneNumber);
            console.log({ verificationCode });
            const verify = await this.sdk.verify.v2.services(this.messagingServiceSid)
                .verifications
                .create({
                    to: validPhoneNumber,
                    channel,
                    customCode: verificationCode.toString(),
                    locale: 'he'
                });
            console.log({ verify });
            return verify.status;
        } catch (e: any) {
            console.error(e)
            throw new Error(e.message);
        }
    }

    async validateVerificationCode(phoneNumber: string, verificationCode: string) {
        try {
            const validPhoneNumber = this.formatPhoneNumber(phoneNumber);
            const validation = await this.sdk.verify.v2.services(this.messagingServiceSid)
                .verifications(validPhoneNumber)
                .update({status: 'approved'})
            return validation.status === 'approved';

        } catch (e: any) {
            console.error(e)
            throw new Error(e.message);
        }
    }
}
