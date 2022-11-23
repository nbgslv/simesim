import React from 'react';
import { Prisma } from '@prisma/client';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { format } from 'date-fns';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';

type PlansAsAdminTableData = (GridValidRowModel &
  Prisma.PlanMaxAggregateOutputType)[];

const Plans = ({ plans }: { plans: PlansAsAdminTableData }) => {
  const [plansRows, setPlansRows] = React.useState<PlansAsAdminTableData>(
    plans
  );

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
    },
    {
      field: 'line',
      headerName: 'Line',
      editable: true,
    },
    {
      field: 'bundle',
      headerName: 'Bundle',
      editable: true,
    },
    {
      field: 'refill',
      headerName: 'Refill',
      editable: true,
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
    },
    {
      field: 'user',
      headerName: 'User',
      editable: true,
    },
    {
      field: 'payment',
      headerName: 'Payment',
      editable: true,
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

  const handleAddRow = async () => {
    const newPlan = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/plans`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    const newPlanJson = await newPlan.json();
    setPlansRows([...plansRows, newPlanJson]);
    return { id: newPlanJson.id, columnToFocus: undefined };
  };

  const handleDeleteRows = async (ids: GridRowId[]) => {
    const deleteCount = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/plans`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      }
    );
    await deleteCount.json();
    setPlansRows(plansRows.filter((plan) => !ids.includes(plan.id!)));
  };

  return (
    <AdminLayout>
      <AdminTable
        data={plansRows}
        columns={columns}
        addRow={handleAddRow}
        deleteRows={handleDeleteRows}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps() {
  const plans = await prisma.plan.findMany({
    include: {
      planModel: true,
      user: true,
      payment: true,
      line: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const serializedPlans = plans.map((plan) => ({
    ...plan,
    createdAt: format(plan.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(plan.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  return {
    props: {
      plans: serializedPlans,
    },
  };
}

export default Plans;
