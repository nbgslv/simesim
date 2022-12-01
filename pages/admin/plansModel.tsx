import { Tooltip } from '@mui/material';
import { NextPageContext } from 'next';
import React, { useEffect } from 'react';
import { Prisma, PlanModel, Bundle, Refill, Coupon } from '@prisma/client';
import {
  GridCellParams,
  GridColumns,
  GridRowId,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { Button } from 'react-bootstrap';
import BundlesAdminModal from '../../components/Bundles/BundlesAdminModal';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import RefillsAdminModal from '../../components/Refills/RefillsAdminModal';
import prisma from '../../lib/prisma';
import AdminTableSwitch from '../../components/AdminTable/AdminTableSwitch';
import FormModal from '../../components/AdminTable/FormModal';
import PlansModelForm from '../../components/PlansModel/PlansModelForm';
import styles from '../../styles/bundles.module.scss';
import { verifyAdmin } from '../../utils/auth';

type PlansModelAsAdminTableData = (GridValidRowModel & PlanModel)[];

type PlansModelProps = {
  plansModel: PlansModelAsAdminTableData;
  existingBundles: (Bundle &
    Prisma.BundleGetPayload<{ select: { refills: true } }>)[];
  existingRefills: Refill[];
  existingCoupons: Coupon[];
};

const PlansModel = ({
  plansModel,
  existingBundles,
  existingRefills,
  existingCoupons,
}: PlansModelProps) => {
  const [plansRows, setPlansRows] = React.useState<PlansModelAsAdminTableData>(
    plansModel
  );
  const [vatToggleLoading, setVatToggleLoading] = React.useState<GridRowId>('');
  const [chosenBundle, setChosenBundle] = React.useState<
    (Bundle & Prisma.BundleGetPayload<{ select: { refills: true } }>) | null
  >(null);
  const [refills, setRefills] = React.useState<Refill[]>(existingRefills);
  const [bundleToShow, setBundleToShow] = React.useState<Bundle | null>(null);
  const [refillToShow, setRefillToShow] = React.useState<Refill | null>(null);
  const modal = useModal('add-plansmodel');

  useEffect(() => {
    setRefills((oldRefills) =>
      oldRefills.filter(
        (refill) =>
          !chosenBundle?.refills
            .map((refillInRefills) => refillInRefills.id)
            .includes(refill.id)
      )
    );
  }, [chosenBundle]);

  const handleBundleSet = (
    bundle: Bundle & Prisma.BundleGetPayload<{ select: { refills: true } }>
  ) => {
    setChosenBundle(bundle);
  };

  const handleVatToggle = async (
    checked: boolean,
    rowId: GridRowId,
    row: GridValidRowModel
  ) => {
    try {
      setVatToggleLoading(rowId);
      const update = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/plansmodel`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...row,
            vat: checked,
            id: row.id,
          }),
        }
      );
      const updateJson = await update.json();
      if (!updateJson.success) throw new Error('Plan Model update failed');
      const serializedUpdate = { ...updateJson };
      serializedUpdate.createdAt = format(
        parseISO(serializedUpdate.createdAt),
        'dd/MM/yy kk:mm'
      );
      serializedUpdate.updatBatchPayloadedAt = format(
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

  const handleShowBundle = (bundle: Bundle) => {
    setBundleToShow(bundle);
  };

  const handleShowRefill = (refill: Refill) => {
    setRefillToShow(refill);
  };

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 200,
    },
    {
      field: 'bundle',
      headerName: 'Bundle',
      renderCell: (params) => (
        <Button onClick={() => handleShowBundle(params.value)}>
          Show Bundle
        </Button>
      ),
      width: 150,
    },
    {
      field: 'refill',
      headerName: 'Refill',
      renderCell: (params) => (
        <Button onClick={() => handleShowRefill(params.value)}>
          Show Refill
        </Button>
      ),
      width: 130,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 130,
    },
    {
      field: 'description',
      headerName: 'Description',
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.value}>
          <span className={styles.tooltip}>{params.value}</span>
        </Tooltip>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      width: 70,
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
      width: 70,
    },
    {
      field: 'coupons',
      headerName: 'Coupons',
      editable: true,
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
      width: 150,
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      width: 150,
    },
  ];

  const addRow = async (
    data: Prisma.PlanModelMaxAggregateOutputType
  ): Promise<{ id: GridRowId; columnToFocus: undefined } | Error> => {
    try {
      if (data) {
        const newPlanModel = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/plansmodel`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          }
        );
        const newPlanModelJson = await newPlanModel.json();
        if (!newPlanModelJson.success)
          throw new Error('Plan Model creation failed');
        setPlansRows([...plansRows, newPlanModelJson.data]);
        return { id: newPlanModelJson.id, columnToFocus: undefined };
      }
      throw new Error('No data');
    } catch (e) {
      console.error(e);
      return e as Error;
    }
  };

  const handleDeleteRows = async (ids: GridRowId[]) => {
    const deleteCount = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/plansmodel`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      }
    );
    const deleteJson = await deleteCount.json();
    if (!deleteJson.success) throw new Error('Plan Model deletion failed');
    setPlansRows(plansRows.filter((plan) => !ids.includes(plan.id!)));
  };

  const showModal = async (): Promise<
    Error | { id: GridRowId; columnToFocus: string | undefined }
  > => {
    try {
      const addData = await NiceModal.show('add-plansmodel');
      return await addRow(addData as PlanModel);
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
      <FormModal
        id="add-plansmodel"
        {...bootstrapDialog(modal)}
        header={'Add Plan Model'}
      >
        <PlansModelForm
          bundles={existingBundles}
          refills={refills}
          coupons={existingCoupons}
          setBundle={handleBundleSet}
        />
      </FormModal>
      <BundlesAdminModal
        bundle={bundleToShow as Bundle}
        show={bundleToShow !== null}
        onHide={() => setBundleToShow(null)}
      />
      <RefillsAdminModal
        onHide={() => setRefillToShow(null)}
        refills={refillToShow ? [refillToShow as Refill] : []}
        show={refillToShow !== null}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
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
    bundle: {
      ...planModel.bundle,
      createdAt: format(planModel.bundle.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(planModel.bundle.updatedAt, 'dd/MM/yy kk:mm'),
    },
    refill: {
      ...planModel.refill,
      createdAt: format(planModel.refill.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(planModel.refill.updatedAt, 'dd/MM/yy kk:mm'),
    },
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
    validFrom: format(coupon.validFrom, 'dd/MM/yy kk:mm'),
    validTo: format(coupon.validTo, 'dd/MM/yy kk:mm'),
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
