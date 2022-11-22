import React from 'react';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import { Prisma } from '@prisma/client';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import prisma from '../../lib/prisma';
import { format, parseISO } from 'date-fns';
import AdminTableSwitch from '../../components/AdminTable/AdminTableSwitch';
import FormModal from '../../components/AdminTable/FormModal';
import PlansModelForm from '../../components/PlansModel/PlansModelForm';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';

type PlansModelAsAdminTableData = (GridValidRowModel &
  Prisma.PlanModelMaxAggregateOutputType)[];

type PlansModelProps = {
  plansModel: PlansModelAsAdminTableData;
  existingBundles: Prisma.BundleMaxAggregateOutputType[];
  existingRefills: Prisma.RefillMaxAggregateOutputType[];
  existingCoupons: Prisma.CouponMaxAggregateOutputType[];
};

const PlansModel = ({
  plansModel,
  existingBundles,
  existingRefills,
  existingCoupons,
}: PlansModelProps) => {
  const [plansRows, setPlansRows] =
    React.useState<PlansModelAsAdminTableData>(plansModel);
  const [vatToggleLoading, setVatToggleLoading] = React.useState<GridRowId>('');
  const [chosenBundle, setChosenBundle] =
    React.useState<Prisma.BundleMaxAggregateOutputType | null>(null);
  const [refills, setRefills] =
    React.useState<Prisma.RefillMaxAggregateOutputType[]>(existingRefills);
  const modal = useModal('add-plansmodel');

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
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
      field: 'name',
      headerName: 'Name',
    },
    {
      field: 'description',
      headerName: 'Description',
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
    },
    {
      field: 'vat',
      headerName: 'Vat',
      renderCell: (params) => (
        <AdminTableSwitch
          checked={params.value}
          onChange={handleVatToggle}
          rowId={params.id}
          row={params.row}
          loading={vatToggleLoading as string}
        />
      ),
    },
    {
      field: 'coupons',
      headerName: 'Coupons',
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

  const handleVatToggle = async (
    checked: boolean,
    rowId: GridRowId,
    row: GridValidRowModel
  ) => {
    try {
      setVatToggleLoading(rowId);
      const update = await fetch('api/plansmodel', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...row,
          vat: checked,
          id: row.id,
        }),
      });
      const updateJson = await update.json();
      const serializedUpdate = { ...updateJson };
      serializedUpdate.createdAt = format(
        parseISO(serializedUpdate.createdAt),
        'dd/MM/yy kk:mm'
      );
      serializedUpdate.updatedAt = format(
        parseISO(serializedUpdate.updatedAt),
        'dd/MM/yy kk:mm'
      );
      setPlansRows(
        plansRows.map((plan) => (plan.id === rowId ? serializedUpdate : plan))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setVatToggleLoading('');
    }
  };

  const addRow = async (data: Prisma.PlanModelMaxAggregateOutputType) => {
    console.log({ data });
    const newPlanModel = await fetch('/api/plansmodel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const newPlanModelJson = await newPlanModel.json();
    console.log({ newPlanModelJson });
    setPlansRows([...plansRows, newPlanModelJson]);
    return { id: newPlanModelJson.id, columnToFocus: undefined };
  };

  const handleDeleteRows = async (ids: GridRowId[]) => {
    const deleteCount = await fetch('/api/plansmodel', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    await deleteCount.json();
    setPlansRows(plansRows.filter((plan) => !ids.includes(plan.id!)));
  };

  const showModal = async () => {
    try {
      const addData = await NiceModal.show('add-plansmodel');
      return addRow(addData as Prisma.PlanModelMaxAggregateOutputType);
    } catch (e) {
      modal.reject(e);
      modal.hide();
      modal.remove();
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
      <FormModal
        id="add-plansmodel"
        {...bootstrapDialog(modal)}
        header={'Add Plan Model'}
      >
        <PlansModelForm
          bundles={existingBundles}
          refills={refills}
          coupons={existingCoupons}
          setBundle={setChosenBundle}
        />
      </FormModal>
    </AdminLayout>
  );
};

export async function getServerSideProps() {
  const plansModel = await prisma.planModel.findMany({
    include: {
      bundle: true,
      refill: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const existingBundles = await prisma.bundle.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const existingRefills = await prisma.refill.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const existingCoupons = await prisma.coupon.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const serializedPlansModel = plansModel.map((planModel) => ({
    ...planModel,
    createdAt: format(planModel.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(planModel.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  const serializedBundles = existingBundles.map((bundle) => ({
    ...bundle,
    createdAt: format(bundle.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(bundle.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  const serializedRefills = existingRefills.map((refill) => ({
    ...refill,
    createdAt: format(refill.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(refill.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  const serializedCoupons = existingCoupons.map((coupon) => ({
    ...coupon,
    createdAt: format(coupon.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(coupon.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  return {
    props: {
      plansModel: serializedPlansModel,
      existingBundles: serializedBundles,
      existingRefills: serializedRefills,
      existingCoupons: serializedCoupons,
    },
  };
}

export default PlansModel;
