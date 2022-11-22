import React, { useEffect } from 'react';
import { DataGrid, GridRowModel } from '@mui/x-data-grid';
import { Plan } from '@prisma/client';
import styles from './UserOrders.module.scss';
import gridTranslation from '../../lib/content/mui-datagrid-translation.json';
import { Button } from 'react-bootstrap';
import PaymentDetailsModal from './PaymentDetailsModal';

const UserOrders = ({ plans }: { plans: Plan[] }) => {
  const [plansRows, setPlansRows] = React.useState<GridRowModel[]>([]);
  const [chosenRowPayment, setChosenRowPayment] = React.useState<string | null>(
    null
  );

  useEffect(() => {
    const plansRows = plans.map((plan) => ({
      ...plan,
      planName: plan.planModel?.name,
      status: plan.line?.status,
      allowedUsageKb: plan.planModel?.allowedUsageKb,
      remainingUsageKb: plan.line?.remainingUsageKb,
      remainingDays: plan.line?.remainingDays,
      qrCode: plan.line?.qrCode,
    }));
    console.log(plansRows);
    setPlansRows(plansRows);
  }, [plans]);

  const columns = [
    {
      field: 'planName',
      headerName: 'התכנית',
    },
    {
      field: 'price',
      headerName: 'מחיר',
      valueFormatter: ({ value }) => `${value}₪`,
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
      renderCell: (params) => (
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
      renderCell: (params) => (
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
    {
      field: 'refill',
      headerName: 'טעינה',
      renderCell: (params) => (
        <Button
          variant="outline-primary"
          className={styles.button}
          disabled={!params.row.allowRefill}
        >
          טעינה
        </Button>
      ),
    },
  ];

  const handleShowQr = (qrCode: string | null) => {
    console.log(qrCode);
  };

  const handleShowPaymentModal = (id: string, payment: string) => {
    setChosenRowPayment({
      friendlyPlanId: id,
      ...payment,
    });
  };

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
