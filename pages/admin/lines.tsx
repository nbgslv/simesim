import React from 'react';
import { Prisma } from '@prisma/client';
import { GridColumns, GridValidRowModel } from '@mui/x-data-grid';
import { format } from 'date-fns';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';

type LineAsAdminTableData = (GridValidRowModel &
  Prisma.LineMaxAggregateOutputType)[];

type LinesProps = {
  lines: LineAsAdminTableData;
};

const Lines = ({ lines }: LinesProps) => {
  const [lineRows, setLineRows] = React.useState<LineAsAdminTableData>(lines);
  const modal = useModal('add-line');

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
    },
    {
      field: 'externalId',
      headerName: 'External ID',
    },
    {
      field: 'Plan',
      headerName: 'Plan',
    },
    {
      field: 'iccid',
      headerName: 'ICCID',
    },
    {
      field: 'productId',
      headerName: 'Product ID',
    },
    {
      field: 'allowedUsageKb',
      headerName: 'Allowed Usage (KB)',
    },
    {
      field: 'remainingUsageKb',
      headerName: 'Remaining Usage (KB)',
    },
    {
      field: 'remainingDays',
      headerName: 'Remaining Days',
    },
    {
      field: 'status',
      headerName: 'Status',
    },
    {
      field: 'bundle',
      headerName: 'Bundle',
    },
    {
      field: 'refill',
      headerName: 'Refill',
    },
    {
      field: 'notes',
      headerName: 'Notes',
    },
    {
      field: 'autoRefillTurnedOn',
      headerName: 'Auto Refill',
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
    },
  ];

  const addRow = async (data: Prisma.LineMaxAggregateOutputType) => {
    const newLine = await fetch('/api/lines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const newLineJson = await newLine.json();
    setLineRows([...lineRows, newLineJson]);
    return { id: newLineJson.id, columnToFocus: undefined };
  };

  const showModal = async () => {
    try {
      const addData = await NiceModal.show('add-users');
      return await addRow(addData as Prisma.LineMaxAggregateOutputType);
    } catch (e) {
      modal.reject(e);
      await modal.hide();
      modal.remove();
      return e as Error;
    }
  };

  return (
    <AdminLayout>
      <AdminTable
        data={lineRows}
        columns={columns}
        addRow={showModal}
        multiActions={['add']}
        rowActions={[]}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps() {
  const lines = await prisma.line.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const serializedLines = lines.map((line) => ({
    ...line,
    createdAt: format(line.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(line.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  return {
    props: {
      lines: serializedLines,
    },
  };
}

export default Lines;
