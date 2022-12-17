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
          discountType: 'text',
        },
        {
          title: 'Amount',
          value: payment.amount,
          discountType: 'number',
        },
        {
          title: 'Status',
          value: payment.status,
          discountType: 'text',
        },
        {
          title: 'Payment Date',
          value: payment.paymentDate || 'N/A',
          discountType: 'date',
        },
        {
          title: 'Clearing Trace ID',
          value: payment.clearingTraceId || 'N/A',
          discountType: 'text',
        },
        {
          title: 'Clearing Confirmation ID',
          value: payment.clearingConfirmationNumber || 'N/A',
          discountType: 'text',
        },
        {
          title: 'Payment ID',
          value: payment.paymentId || 'N/A',
          discountType: 'text',
        },
        {
          title: 'Invoice 4 U Clearing ID',
          value: payment.i4UClearingLogId || 'N/A',
          discountType: 'text',
        },
        {
          title: 'Receipt',
          value: payment.docId || 'N/A',
          discountType: 'text',
        },
        {
          title: 'Created At',
          value: payment.createdAt,
          discountType: 'date',
        },
        {
          title: 'Updated At',
          value: payment.updatedAt,
          discountType: 'date',
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
          discountType: 'text',
        },
        {
          title: 'Token',
          value: payment.paymentMethod?.token || 'N/A',
          discountType: 'number',
        },
        {
          title: 'Is Bit Payment',
          value: payment.paymentMethod?.IsBitPayment ? 'Yes' : 'No',
          discountType: 'boolean',
          editable: true,
        },
        {
          title: 'Card Type',
          value: payment.paymentMethod?.cardType || 'N/A',
          discountType: 'text',
        },
        {
          title: 'Card Number',
          value: payment.paymentMethod?.last4 || 'N/A',
          discountType: 'text',
        },
        {
          title: 'Created At',
          value: payment.paymentMethod?.createdAt || 'N/A',
          discountType: 'date',
        },
        {
          title: 'Updated At',
          value: payment.paymentMethod?.updatedAt || 'N/A',
          discountType: 'date',
        },
      ],
    },
  ];

  const handlePaymentUpdate = async (updatedPayment: Payment) => {
    try {
      const sanitizedUpdatedPayment: Payment & { IsBitPayment?: boolean } = {
        ...updatedPayment,
      };
      if (Object.keys(updatedPayment).includes('isBitPayment')) {
        // @ts-ignore
        sanitizedUpdatedPayment.IsBitPayment = updatedPayment.isBitPayment;
      }
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
