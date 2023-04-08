// @ts-ignore
import MailerSend, { BlockListType } from 'mailersend';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

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

  private nodemailer;

  private notificationsSubscribers = ['nbgslv@gmail.com'];

  private notificationsSender = '"Notifications" inbound@simesim.co.il';

  private Recipient = MailerSend.Recipient;

  private EmailParams = MailerSend.EmailParams;

  private Email: MailerSend.EmailParams;

  constructor() {
    this.mailerSend = new MailerSend({
      api_key: process.env.MAILER_SNED_API_KEY || '',
    });
    this.nodemailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL_USER_NAME!,
        pass: process.env.SMTP_EMAIL_PASSWORD!,
      },
      tls: {
        rejectUnauthorized: false,
      },
      logging: true,
    } as SMTPTransport.Options);
    this.nodemailer.verify((error) => {
      if (error) {
        console.error(error);
      } else {
        // eslint-disable-next-line no-console
        console.log('Server is ready to take our messages');
      }
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

  async unsubscribe(email: string) {
    await this.mailerSend.email.recipient.blockRecepients(
      {
        domain_id: process.env.MAILER_SEND_DOMAIN_ID || '',
        recipients: [email],
      },
      BlockListType.UNSUBSCRIBE
    );
  }

  async sendNotificationEmail(body: string, subject: string) {
    const mailOptions = {
      from: this.notificationsSender,
      to: this.notificationsSubscribers,
      subject,
      html: body,
    };

    const emailSent = await this.nodemailer.sendMail(mailOptions);
    // eslint-disable-next-line no-console
    console.log({ emailSent });
  }
}
