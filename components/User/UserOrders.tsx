import React, { useEffect } from 'react';
import { DataGrid, GridCellParams, GridRowModel } from '@mui/x-data-grid';
import { Plan, Prisma } from '@prisma/client';
import { Button } from 'react-bootstrap';
import styles from './UserOrders.module.scss';
import gridTranslation from '../../lib/content/mui-datagrid-translation.json';
import PaymentDetailsModal, { ExtendedPayment } from './PaymentDetailsModal';

const UserOrders = ({
  plans,
}: {
  plans: (Plan &
    Prisma.PlanGetPayload<{ select: { planModel: true; line: true } }>)[];
}) => {
  const [plansRows, setPlansRows] = React.useState<GridRowModel[]>([]);
  const [chosenRowPayment, setChosenRowPayment] = React.useState<
    | (ExtendedPayment &
        Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>)
    | null
  >(null);

  useEffect(() => {
    setPlansRows(
      plans.map((plan) => ({
        ...plan,
        planName: plan.planModel?.name,
        status: plan.line?.status,
        allowedUsageKb: plan.line?.allowedUsageKb,
        remainingUsageKb: plan.line?.remainingUsageKb,
        remainingDays: plan.line?.remainingDays,
        qrCode: plan.line?.qrCode,
      }))
    );
  }, [plans]);

  const handleShowQr = (qrCode: string | null) => {
    // TODO add QR code modal
    // eslint-disable-next-line no-console
    console.log(qrCode);
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
    },
    {
      field: 'price',
      headerName: 'מחיר',
      valueFormatter: ({ value }: { value: string }) => `${value}₪`,
    },
    {
      field: 'status',
      headerName: 'סטטוס',
    },
    {
      field: 'allowedUsageKb',
      headerName: 'נפח החבילה',
    },
    {
      field: 'remainingUsageKb',
      headerName: 'נפח שנותר',
    },
    {
      field: 'remainingDays',
      headerName: 'ימים שנותרו',
    },
    {
      field: 'qrCode',
      headerName: 'קוד QR',
      renderCell: (params: GridCellParams) => (
        <Button
          variant="outline-primary"
          className={styles.button}
          disabled={!params.row.qrCode}
          onClick={() => handleShowQr(params.row.qrCode)}
        >
          לצפייה
        </Button>
      ),
    },
    {
      field: 'payment',
      headerName: 'פרטי תשלום',
      renderCell: (params: GridCellParams) => (
        <Button
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
      />
      <PaymentDetailsModal
        show={!!chosenRowPayment}
        payment={chosenRowPayment}
        handleModalHide={handlePaymentModalHide}
      />
    </div>
  );
};

export default UserOrders;
