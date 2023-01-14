import React, { useEffect, useState } from 'react';
import { DataGrid, GridCellParams, GridRowModel } from '@mui/x-data-grid';
import { Plan, Prisma } from '@prisma/client';
import { Button } from 'react-bootstrap';
import QrModal from '../QrModal/QrModal';
import styles from './UserOrders.module.scss';
import gridTranslation from '../../lib/content/mui-datagrid-translation.json';
import PaymentDetailsModal, { ExtendedPayment } from './PaymentDetailsModal';

const UserOrders = ({
  plans,
}: {
  plans: (Plan &
    Prisma.PlanGetPayload<{ select: { planModel: true; line: true } }>)[];
}) => {
  const [plansRows, setPlansRows] = useState<GridRowModel[]>([]);
  const [chosenRowPayment, setChosenRowPayment] = useState<
    | (ExtendedPayment &
        Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>)
    | null
  >(null);
  const [chosenRowQr, setChosenRowQr] = useState<string | null>(null);

  useEffect(() => {
    setPlansRows(
      plans.map((plan) => ({
        ...plan,
        planName: plan.planModel?.name,
        status: plan.status,
        allowedUsageKb: plan.line?.allowedUsageKb,
        remainingUsageKb: plan.line?.remainingUsageKb,
        remainingDays: plan.line?.remainingDays,
        qrCode: plan.line?.qrCode,
      }))
    );
  }, [plans]);

  const handleShowQr = (qrCode: string | null) => {
    setChosenRowQr(qrCode);
  };

  const handleShowPaymentModal = (
    id: string,
    payment: ExtendedPayment &
      Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>
  ) => {
    setChosenRowPayment({
      // @ts-ignore
      friendlyPlanId: id,
      ...payment,
    });
  };

  const columns = [
    {
      field: 'planName',
      headerName: 'התכנית',
      renderHeader: () => (
        <div
          role="columnheader"
          aria-label="plan name"
          className={styles.headerCell}
        >
          התכנית
        </div>
      ),
      width: 200,
    },
    {
      field: 'price',
      headerName: 'מחיר',
      valueFormatter: ({ value }: { value: string }) => `₪${value}`,
      renderHeader: () => (
        <div
          role="columnheader"
          aria-label="plan price"
          className={styles.headerCell}
        >
          מחיר
        </div>
      ),
    },
    {
      field: 'status',
      headerName: 'סטטוס',
      valueFormatter: ({ value }: { value: string }) => {
        switch (value) {
          case 'ACTIVE':
            return 'פעילה';
          case 'CANCELLED':
            return 'בוטלה';
          case 'PENDING':
            return 'ממתינה לאישור';
          case 'EXPIRED':
            return 'פג תוקף';
          default:
            return value;
        }
      },
      renderHeader: () => (
        <div
          role="columnheader"
          aria-label="plan status"
          className={styles.headerCell}
        >
          סטטוס
        </div>
      ),
    },
    {
      field: 'allowedUsageKb',
      headerName: 'נפח החבילה',
      valueFormatter: ({ value }: { value: string }) =>
        `${
          value ? `${Math.floor(parseInt(value, 10) / 1000000)}GB` : 'לא ידוע'
        }`,
      renderHeader: () => (
        <div
          role="columnheader"
          aria-label="plan allowed usage"
          className={styles.headerCell}
        >
          נפח החבילה
        </div>
      ),
    },
    {
      field: 'remainingUsageKb',
      headerName: 'נפח שנותר',
      valueFormatter: ({ value }: { value: string }) =>
        `${
          value ? `${Math.floor(parseInt(value, 10) / 1000000)}GB` : 'לא ידוע'
        }`,
      // TODO show progress bar
    },
    {
      field: 'remainingDays',
      headerName: 'ימים שנותרו',
      valueFormatter: ({ value }: { value: string }) =>
        `${value ? `${value} ימים` : 'לא ידוע'}`,
      renderHeader: () => (
        <div
          role="columnheader"
          aria-label="plan remaining days"
          className={styles.headerCell}
        >
          ימים שנותרו
        </div>
      ),
    },
    {
      field: 'qrCode',
      headerName: 'קוד QR',
      renderHeader: () => (
        <div
          role="columnheader"
          aria-label="activation qr code"
          className={styles.headerCell}
        >
          קוד QR
        </div>
      ),
      renderCell: (params: GridCellParams) => (
        <Button
          tabIndex={params.tabIndex}
          variant="outline-primary"
          className={styles.button}
          disabled={!params.row.line.qrCode}
          onClick={() => handleShowQr(params.row.line.qrCode)}
        >
          לצפייה
        </Button>
      ),
    },
    {
      field: 'payment',
      headerName: 'פרטי תשלום',
      renderHeader: () => (
        <div
          role="columnheader"
          aria-label="payment details"
          className={styles.headerCell}
        >
          פרטי תשלום
        </div>
      ),
      renderCell: (params: GridCellParams) => (
        <Button
          tabIndex={params.tabIndex}
          variant="outline-primary"
          className={styles.button}
          onClick={() =>
            handleShowPaymentModal(params.row.friendlyId, params.row.payment)
          }
        >
          פרטים
        </Button>
      ),
    },
    /*
    {
      field: 'refill',
      headerName: 'טעינה',
      renderCell: (params: GridCellParams) => (
        <Button
          variant="outline-primary"
          className={styles.button}
          disabled={!params.row.allowRefill}
        >
          טעינה
        </Button>
      ),
    },
     */
  ];

  const handlePaymentModalHide = () => {
    setChosenRowPayment(null);
  };

  const handleQrModalHide = () => {
    setChosenRowQr(null);
  };

  return (
    <div className={styles.main}>
      <DataGrid
        columns={columns}
        rows={plansRows}
        disableColumnFilter
        disableColumnMenu
        disableSelectionOnClick
        localeText={{
          ...gridTranslation,
          MuiTablePagination: {
            labelDisplayedRows: ({ from, to, count }) =>
              `${from}-${to} מתוך ${count !== -1 ? count : `מעל ${to}`}`,
          },
        }}
        pageSize={10}
        aria-label="my orders"
      />
      <PaymentDetailsModal
        show={!!chosenRowPayment}
        payment={chosenRowPayment}
        handleModalHide={handlePaymentModalHide}
      />
      <QrModal
        show={!!chosenRowQr}
        handleModalHide={handleQrModalHide}
        qrCode={chosenRowQr}
      />
    </div>
  );
};

export default UserOrders;
