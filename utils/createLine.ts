import QRCode from 'qrcode';
import { Line as LineRecord } from '@prisma/client';
import KeepGoApi from './api/services/keepGo/api';
import Email from './email';
import prisma from '../lib/prisma';
import { CreateLine, Line } from './api/services/keepGo/types';

export enum LineStatus {
  CREATED_WITHOUT_LINE,
  CREATED_WITH_LINE,
}

type LineDetails = {
  status: LineStatus;
  lineDetails: LineRecord | null;
};

type CreateLineParams = {
  planId: string;
  planFriendlyId: number;
  refillMb: number;
  refillDays: number | null;
  bundleExternalId: number;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
};
async function createLine({
  planId,
  planFriendlyId,
  refillMb,
  refillDays,
  bundleExternalId,
  userEmail,
  userFirstName,
  userLastName,
}: CreateLineParams): Promise<LineDetails> {
  if (process.env.NODE_ENV === 'development') {
    // Send new order email to user
    const emailService = new Email();

    const recipients = [
      emailService.setRecipient(userEmail, `${userFirstName} ${userLastName}`),
    ];

    const emailAttachments = [
      {
        content: `iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQMAAAC6caSPAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABuklEQVR4nO3bO3KDMBSFYXlSqPQSWApLw0vzUliCSxeeKOg+hCDMJKW5/k8FSJ8r7uhhkRIhMfJVurzk0VhuyW6Gck9T3+MGgQQiT6+Dy9Irl4eQ5UZTSauUEQIJRq7SKMRTvtuPTcX8DIFEJlkubbDISy8I5FNIWm7utUou3UwJAjkHsfjL303z7eX3QCCxSJd1zm/Tnv+skSGQk5JfsZFDM+jI8UcgkFOStV62Gzz1pg4jVjy1jtxDIDGIZyzmH/0+v2YhR8UDgbwVye31L+s/Vq2l9pK2+vL7tAcCiUFqrBS0Xmpkzu9p3UYIJBSpVTHXC53pXKUqpKtOe+xS1wIQSByiJVLrxUpE66Xb509HywQIJAJ5SlMpXb0sWQeL236mBIFEIjIo6Eq4xv7XyvKnrsQ7QSBvTQZteG1Je65FMdtDCCQG2SX7gre0gwtJVwOPYwCBnJYcnFVI3svPKiw3+wUvBBKBPL0ONift12+sWr0MEEg4sjlpf7DPX/ZbnRDIWYhl8BYPBBKcTLr1k9c1bp3+z91uDwQSg1j6z0ysZWiFIj8FgcQiXfwzk9KfzdkEAolDCPnQ/AC61cSZpmB98QAAAABJRU5ErkJggg==`,
        filename: 'qrCode.png',
        disposition: 'inline' as 'inline',
        id: 'qrCode',
      },
    ];
    const emailVariables = [
      {
        email: userEmail,
        substitutions: [
          {
            var: 'fullName',
            value: `ישראל ישראלי`,
          },
          {
            var: 'orderId',
            value: '123456',
          },
          {
            var: 'amountDays',
            value: `7`,
          },
        ],
      },
    ];
    emailService.setEmailParams(
      'order@simesim.co.il',
      'שים eSim',
      recipients,
      'הזמנתך מאתר שים eSim',
      process.env.EMAIL_TEMPLATE_USER_NEW_LINE || '',
      undefined,
      emailAttachments,
      emailVariables
    );

    await emailService.send();

    return {
      status: LineStatus.CREATED_WITHOUT_LINE,
      lineDetails: null,
    };
  }

  const keepGoApi = new KeepGoApi(
    process.env.KEEPGO_BASE_URL || '',
    process.env.KEEPGO_API_KEY || '',
    process.env.KEEPGO_ACCESS_TOKEN || ''
  );

  // Create line
  const newLine = await keepGoApi.createLine({
    refillMb,
    refillDays,
    bundleId: bundleExternalId,
  });

  // eslint-disable-next-line no-console
  console.log({ newLine });

  // Instantiate email client
  const emailService = new Email();

  const recipients = [
    emailService.setRecipient(userEmail, `${userFirstName} ${userLastName}`),
  ];

  // If line wasn't created - send pending email and update plan status
  if (!newLine || newLine instanceof Error || newLine.ack !== 'success') {
    await prisma.plan.update({
      where: {
        id: planId,
      },
      data: {
        status: 'PENDING',
      },
    });

    const bcc = [
      emailService.setRecipient('nbgslv@gmail.com', 'נחמן בוגוסלבסקי'),
    ];
    const emailVariables = [
      {
        email: userEmail,
        substitutions: [
          {
            var: 'fullName',
            value: `${userFirstName} ${userLastName}`,
          },
          {
            var: 'orderId',
            value: planFriendlyId.toString(),
          },
        ],
      },
    ];

    emailService.setEmailParams(
      'order@simesim.co.il',
      'שים eSim',
      recipients,
      'הזמנתך מאתר שים eSim',
      process.env.EMAIL_TEMPLATE_USER_PENDING_LINE || '',
      bcc,
      undefined,
      emailVariables
    );
    await emailService.send();

    return {
      status: LineStatus.CREATED_WITHOUT_LINE,
      lineDetails: null,
    };
  }

  // Get full line details and create line record
  const newLineDetails = await keepGoApi.getLineDetails(
    (newLine.sim_card as CreateLine)?.iccid
  );

  // eslint-disable-next-line no-console
  console.log({ newLineDetails });

  if (newLineDetails instanceof Error) {
    throw new Error('No line details');
  }

  await keepGoApi.updateLineNotes(
    (newLineDetails.sim_card as CreateLine).iccid,
    JSON.stringify({
      planId,
      planFriendlyId,
      userEmail,
      userFirstName,
      userLastName,
    })
  );

  const qrCode = await QRCode.toDataURL(
    (newLineDetails.sim_card as CreateLine)?.lpa_code
  );

  const newLineRecord: LineRecord = await prisma.line.create({
    data: {
      deactivationDate:
        (newLineDetails.sim_card as Line)?.deactivation_date || null,
      allowedUsageKb: (newLineDetails.sim_card as Line)?.allowed_usage_kb,
      remainingUsageKb: (newLineDetails.sim_card as Line)?.remaining_usage_kb,
      remainingDays: (newLineDetails.sim_card as Line)?.remaining_days || null,
      status: (newLineDetails.sim_card as Line)?.status,
      autoRefillTurnedOn: (newLineDetails.sim_card as Line)
        ?.auto_refill_turned_on,
      autoRefillAmountMb: (newLineDetails.sim_card as Line)?.auto_refill_amount_mb.toString(),
      autoRefillPrice: (newLineDetails.sim_card as Line)?.auto_refill_price,
      autoRefillCurrency: (newLineDetails.sim_card as Line)
        ?.auto_refill_currency,
      notes: (newLineDetails.sim_card as Line)?.notes,
      iccid: (newLine.sim_card as CreateLine)?.iccid,
      lpaCode: (newLine.sim_card as CreateLine)?.lpa_code,
      qrCode,
    },
  });

  // Send new order email to user
  const emailAttachments = [
    {
      content: qrCode.replace(/^data:image\/png;base64,/, ''),
      filename: 'qrCode.png',
      disposition: 'inline' as 'inline',
      id: 'qrCode',
    },
  ];
  const emailVariables = [
    {
      email: userEmail,
      substitutions: [
        {
          var: 'fullName',
          value: `${userFirstName} ${userLastName}`,
        },
        {
          var: 'orderId',
          value: planFriendlyId.toString(),
        },
        {
          var: 'amountDays',
          value: `${refillDays}`,
        },
      ],
    },
  ];
  emailService.setEmailParams(
    'order@simesim.co.il',
    'שים eSim',
    recipients,
    'הזמנתך מאתר שים eSim',
    process.env.EMAIL_TEMPLATE_USER_NEW_LINE || '',
    undefined,
    emailAttachments,
    emailVariables
  );

  await emailService.send();

  return {
    status: LineStatus.CREATED_WITH_LINE,
    lineDetails: newLineRecord,
  };
}

export default createLine;
