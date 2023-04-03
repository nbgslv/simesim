export enum Channel {
  SMS = 'sms',
  VOICE = 'call',
  WHATSAPP = 'whatsapp',
}

export default class TwilioApi {
  private readonly sdk: any;

  private readonly messagingServiceSid: string;

  private readonly whatsappSender: string = '+972512896510';

  constructor(
    accountSid: string,
    authToken: string,
    messagingServiceSid: string
  ) {
    // eslint-disable-next-line global-require
    this.sdk = require('twilio')(accountSid, authToken);
    this.messagingServiceSid = messagingServiceSid;
  }

  static formatPhoneNumber(phoneNumber: string) {
    return phoneNumber.replace('0', '+972');
  }

  async sendVerificationCode(
    phoneNumber: string,
    verificationCode: string,
    channel: Channel
  ) {
    try {
      const validPhoneNumber = TwilioApi.formatPhoneNumber(phoneNumber);
      const verify = await this.sdk.verify.v2
        .services(this.messagingServiceSid)
        .verifications.create({
          to: validPhoneNumber,
          channel,
          customCode: verificationCode.toString(),
          locale: 'he',
        });
      return verify.status;
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async validateVerificationCode(phoneNumber: string) {
    try {
      const validPhoneNumber = TwilioApi.formatPhoneNumber(phoneNumber);
      const validation = await this.sdk.verify.v2
        .services(this.messagingServiceSid)
        .verifications(validPhoneNumber)
        .update({ status: 'approved' });
      return validation.status === 'approved';
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }

  async sendWhatsappMessage(phoneNumber: string, message: string) {
    try {
      const validPhoneNumber = TwilioApi.formatPhoneNumber(phoneNumber);
      return this.sdk.messages.create({
        body: message,
        from: `whatsapp:${this.whatsappSender}`,
        to: `whatsapp:${validPhoneNumber}`,
      });
    } catch (e: any) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
