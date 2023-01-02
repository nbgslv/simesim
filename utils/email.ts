// @ts-ignore
import MailerSend from 'mailersend';

type Attachment = {
  content: string;
  filename: string;
  disposition: 'inline' | 'attachment';
  id?: string;
};

type Substitution = {
  var: string;
  value: string;
};

type Variable = {
  email: string;
  substitutions: Substitution[];
};

export default class Email {
  private mailerSend;

  private Recipient = MailerSend.Recipient;

  private EmailParams = MailerSend.EmailParams;

  private Email: MailerSend.EmailParams;

  constructor() {
    this.mailerSend = new MailerSend({
      api_key: process.env.MAILER_SNED_API_KEY || '',
    });
  }

  setRecipient(email: string, name: string): MailerSend.Recipient {
    return new this.Recipient(email, name);
  }

  setEmailParams(
    from: string,
    fromName: string,
    recipients: MailerSend.Recipient[],
    subject: string,
    templateId: string,
    bcc?: MailerSend.Recipient[],
    attachments?: Attachment[],
    variables?: Variable[]
  ) {
    const email = new this.EmailParams()
      .setFrom(from)
      .setFromName(fromName)
      .setRecipients(recipients)
      .setSubject(subject)
      .setTemplateId(templateId);

    if (bcc) {
      email.setBcc(bcc);
    }

    if (attachments) {
      email.setAttachments(attachments);
    }

    if (variables) {
      email.setVariables(variables);
    }

    this.Email = email;
  }

  async send() {
    if (!this.Email) {
      throw new Error('Email is not set');
    } else {
      const email = await this.mailerSend.send(this.Email);

      if (email.status > 202) {
        const emailJson = await email.json();
        // eslint-disable-next-line no-console
        console.log({ emailJson });
      }
    }
  }
}
