import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NextPageContext } from 'next';
import React from 'react';
import { Transaction } from '@prisma/client';
import {
  GridCellParams,
  GridColumns,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import { Button } from 'react-bootstrap';
import { Tooltip } from '@mui/material';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';
import AdminCopy from '../../components/AdminCopy/AdminCopy';
import styles from '../../styles/bundles.module.scss';

type TransactionAsAdminTableData = (GridValidRowModel & Transaction)[];

type LinesProps = {
  transactions: TransactionAsAdminTableData;
};

const Transactions = ({ transactions }: LinesProps) => {
  const [transactionsRows] = React.useState<TransactionAsAdminTableData>(
    transactions
  );

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      renderCell: (params: GridCellParams) => (
        <AdminCopy>{params.value}</AdminCopy>
      ),
      width: 250,
    },
    {
      field: 'createdAtExternal',
      headerName: 'Created At',
      width: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
    },
    {
      field: 'amount',
      headerName: 'Amount',
    },
    {
      field: 'currency',
      headerName: 'Currency',
    },
    {
      field: 'type',
      headerName: 'Type',
    },
    {
      field: 'refillAmountMb',
      headerName: 'Refill Amount Mb',
    },
    {
      field: 'reason',
      headerName: 'Reason',
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.value}>
          <span className={styles.tooltip}>{params.value}</span>
        </Tooltip>
      ),
    },
    {
      field: 'transactionId',
      headerName: 'Transaction ID',
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.value}>
          <AdminCopy>
            <span className={styles.tooltip}>{params.value}</span>
          </AdminCopy>
        </Tooltip>
      ),
      width: 250,
    },
    {
      field: 'invoiceHash',
      headerName: 'Download Invoice',
      renderCell: (params: GridCellParams) => (
        <Button
          href={`https://myaccount.keepgo.com/invoice/${params.value}/pdf`}
        >
          <FontAwesomeIcon icon={solid('file-arrow-down')} />
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title="Transactions">
      <AdminTable
        data={transactionsRows}
        columns={columns}
        multiActions={[]}
        rowActions={[]}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const transactions = await prisma.transaction.findMany({
    orderBy: {
      createdAtExternal: 'desc',
    },
  });

  const serializedTransactions = transactions.map((transaction) => ({
    ...transaction,
    createdAtExternal: format(
      parseISO(transaction.createdAtExternal),
      'dd/MM/yy kk:mm'
    ),
  }));

  return {
    props: {
      transactions: serializedTransactions,
    },
  };
}

export default Transactions;
