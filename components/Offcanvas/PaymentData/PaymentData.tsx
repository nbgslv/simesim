import React from 'react';
import { Payment, Prisma } from '@prisma/client';
import AdminApi from '../../../utils/api/services/adminApi';
import Section, { SectionType } from '../Section';

type PaymentDataType = Payment &
  Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>;

const PaymentData = ({
  payment,
  onDataChange,
}: {
  payment: PaymentDataType;
  onDataChange?: (data: PaymentDataType | null) => void;
}) => {
  const [adminApi] = React.useState<AdminApi>(new AdminApi());

  if (!payment) return null;

  const data: SectionType<
    Payment & Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>
  >[] = [
    {
      title: 'Payment',
      id: 'payment',
      data: [
        {
          title: 'ID',
          value: payment.id,
          type: 'text',
        },
        {
          title: 'Amount',
          value: payment.amount,
          type: 'number',
        },
        {
          title: 'Status',
          value: payment.status,
          type: 'text',
        },
        {
          title: 'Payment Date',
          value: payment.paymentDate || 'N/A',
          type: 'date',
        },
        {
          title: 'Clearing Trace ID',
          value: payment.clearingTraceId || 'N/A',
          type: 'text',
        },
        {
          title: 'Clearing Confirmation ID',
          value: payment.clearingConfirmationNumber || 'N/A',
          type: 'text',
        },
        {
          title: 'Payment ID',
          value: payment.paymentId || 'N/A',
          type: 'text',
        },
        {
          title: 'Invoice 4 U Clearing ID',
          value: payment.i4UClearingLogId || 'N/A',
          type: 'text',
        },
        {
          title: 'Receipt',
          value: payment.docId || 'N/A',
          type: 'text',
        },
        {
          title: 'Created At',
          value: payment.createdAt,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: payment.updatedAt,
          type: 'date',
        },
      ],
    },
    {
      title: 'Payment Method',
      id: 'paymentMethod',
      data: [
        {
          title: 'ID',
          value: payment.paymentMethod?.id || 'N/A',
          type: 'text',
        },
        {
          title: 'Token',
          value: payment.paymentMethod?.token || 'N/A',
          type: 'number',
        },
        {
          title: 'Is Bit Payment',
          value: payment.paymentMethod?.isBitPayment ? 'Yes' : 'No',
          type: 'boolean',
          editable: true,
        },
        {
          title: 'Card Type',
          value: payment.paymentMethod?.cardType || 'N/A',
          type: 'text',
        },
        {
          title: 'Card Number',
          value: payment.paymentMethod?.last4 || 'N/A',
          type: 'text',
        },
        {
          title: 'Created At',
          value: payment.paymentMethod?.createdAt || 'N/A',
          type: 'date',
        },
        {
          title: 'Updated At',
          value: payment.paymentMethod?.updatedAt || 'N/A',
          type: 'date',
        },
      ],
    },
  ];

  const handlePaymentUpdate = async (updatedPayment: Payment) => {
    try {
      const updatedPaymentRecord = await adminApi.callApi<
        Payment & Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>,
        'update',
        { select: { paymentMethod: true } }
      >({
        method: 'PUT',
        model: 'Payment',
        input: {
          where: {
            id: payment.id,
          },
          data: { paymentMethod: { update: updatedPayment } },
          include: {
            paymentMethod: true,
          },
        },
      });
      onDataChange?.(updatedPaymentRecord);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePaymentDelete = async () => {
    try {
      await adminApi.callApi<Payment, 'delete'>({
        method: 'DELETE',
        model: 'Payment',
        input: {
          where: {
            id: payment.id,
          },
        },
      });
      onDataChange?.(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Section
        sections={data}
        onSave={handlePaymentUpdate}
        onDelete={handlePaymentDelete}
      />
    </div>
  );
};

export default PaymentData;
