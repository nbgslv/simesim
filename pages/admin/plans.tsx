import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { NextPageContext } from 'next';
import React from 'react';
import { Payment, Plan, User, PlanModel, Prisma } from '@prisma/client';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { format } from 'date-fns';
import FormModal from '../../components/AdminTable/FormModal';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import PlansForm from '../../components/Plans/PlansForm';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';

type PlansAsAdminTableData = (GridValidRowModel & Plan)[];

type PlansProps = {
  plans: PlansAsAdminTableData;
  plansModel: PlanModel[];
  payments: (Payment & Prisma.PaymentGetPayload<{ select: { user: true } }>)[];
  users: User[];
};

const Plans = ({ plans, plansModel, payments, users }: PlansProps) => {
  const [plansRows, setPlansRows] = React.useState<PlansAsAdminTableData>(
    plans
  );
  const [addRowLoading, setAddRowLoading] = React.useState<boolean>(false);
  const modal = useModal('add-plans');

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
    const deleteCountJson = await deleteCount.json();
    if (!deleteCountJson.success) throw new Error('Plan deletion failed');
    setPlansRows(plansRows.filter((plan) => !ids.includes(plan.id!)));
  };

  const addRow = async (
    data: Plan
  ): Promise<{ id: string; columnToFocus: undefined }> => {
    setAddRowLoading(true);
    const newPlan = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/plan`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    const newPlanJson = await newPlan.json();
    if (!newPlanJson.success) throw new Error('Plan creation failed');
    setPlansRows([...plansRows, newPlanJson.data]);
    setAddRowLoading(false);
    await modal.hide();
    return { id: newPlanJson.id, columnToFocus: undefined };
  };

  const showModal = async (): Promise<
    { id: string; columnToFocus: undefined } | Error
  > => {
    try {
      const addData = await NiceModal.show('add-plans');
      return await addRow(addData as Plan);
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
        data={plansRows}
        columns={columns}
        addRow={showModal}
        deleteRows={handleDeleteRows}
      />
      <FormModal id="add-plans" {...bootstrapDialog(modal)} header={'Add Plan'}>
        <PlansForm
          plansModel={plansModel}
          payments={payments}
          users={users}
          loading={addRowLoading}
        />
      </FormModal>
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const plans = await prisma.plan.findMany({
    include: {
      planModel: true,
      user: true,
      payment: true,
      line: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  const serializedPlans = plans.map((plan) => ({
    ...plan,
    planModel: {
      ...plan.planModel,
      createdAt: format(plan.planModel.createdAt, 'MM/dd/yyyy'),
      updatedAt: format(plan.planModel.updatedAt, 'MM/dd/yyyy'),
    },
    user: {
      ...plan.user,
      emailVerified: plan.user.emailVerified
        ? format(plan.user.emailVerified, 'MM/dd/yyyy')
        : null,
      lastLogin: plan.user.lastLogin
        ? format(plan.user.lastLogin, 'MM/dd/yyyy')
        : null,
      createdAt: format(plan.user.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(plan.user.updatedAt, 'dd/MM/yy kk:mm'),
    },
    payment: {
      ...plan.payment,
      createdAt: format(
        plan.payment?.createdAt || new Date(),
        'dd/MM/yy kk:mm'
      ),
      updatedAt: format(
        plan.payment?.updatedAt || new Date(),
        'dd/MM/yy kk:mm'
      ),
    },
    line: {
      ...plan.line,
      createdAt: format(plan.line?.createdAt || new Date(), 'dd/MM/yy kk:mm'),
      updatedAt: format(plan.line?.updatedAt || new Date(), 'dd/MM/yy kk:mm'),
    },
    createdAt: format(plan.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(plan.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  const plansModel = await prisma.planModel.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const serializedPlansModel = plansModel.map((planModel) => ({
    ...planModel,
    createdAt: format(planModel.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(planModel.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  const payments = await prisma.payment.findMany({
    include: {
      user: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const serializedPayments = payments.map((payment) => ({
    ...payment,
    user: {
      ...payment.user,
      emailVerified: payment.user.emailVerified
        ? format(payment.user.emailVerified, 'MM/dd/yyyy')
        : null,
      lastLogin: payment.user.lastLogin
        ? format(payment.user.lastLogin, 'MM/dd/yyyy')
        : null,
      createdAt: format(payment.user.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(payment.user.updatedAt, 'dd/MM/yy kk:mm'),
    },
    createdAt: format(payment.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(payment.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  const users = await prisma.user.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const serializedUsers = users.map((user) => ({
    ...user,
    emailVerified: user.emailVerified
      ? format(user.emailVerified, 'MM/dd/yyyy')
      : null,
    lastLogin: user.lastLogin ? format(user.lastLogin, 'MM/dd/yyyy') : null,
    createdAt: format(user.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(user.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  return {
    props: {
      plans: serializedPlans,
      plansModel: serializedPlansModel,
      payments: serializedPayments,
      users: serializedUsers,
    },
  };
}

export default Plans;
