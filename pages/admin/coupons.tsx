import React, { useEffect } from 'react';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import { format, parse } from 'date-fns';
import { Coupon, PlanModel } from '@prisma/client';
import { GridColumns, GridValidRowModel } from '@mui/x-data-grid';
import FormModal from '../../components/AdminTable/FormModal';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import CouponsForm from '../../components/Coupons/CouponsForm';
import DatePicker from 'react-datepicker';
import styles from '../../styles/coupons.module.scss';

type CouponsAsAdminTableData = (GridValidRowModel & Coupon)[];

const Coupons = ({
  coupons,
  plansModel,
}: {
  coupons: CouponsAsAdminTableData;
  plansModel: PlanModel[];
}) => {
  const [couponsRows, setCouponsRows] =
    React.useState<CouponsAsAdminTableData>(coupons);
  const [addRowLoading, setAddRowLoading] = React.useState<boolean>(false);
  const modal = useModal('add-coupons');

  useEffect(() => {
    setCouponsRows(coupons);
  }, [coupons]);

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
    },
    {
      field: 'code',
      headerName: 'Code',
      editable: true,
    },
    {
      field: 'discount',
      headerName: 'Discount',
      valueGetter: (params: any) =>
        `${params.value}${
          params.row.discountType === 'PERCENT' ? '%' : '\u20AA'
        }`,
      editable: true,
    },
    {
      field: 'discountType',
      headerName: 'Type',
      type: 'singleSelect',
      editable: true,
      valueOptions: ['PERCENT', 'AMOUNT'],
      cellClassName: styles.cell,
    },
    {
      field: 'validFrom',
      headerName: 'Valid From',
      editable: true,
      renderEditCell: (params) => {
        const { id, field, value } = params;
        console.log(value);
        return (
          <DatePicker
            selected={parse(value, 'dd/MM/yyyy kk:mm', new Date())}
            dateFormat="dd/MM/yyyy"
            onChange={(date) =>
              params.api.setEditCellValue({
                id,
                field,
                value: format(date as Date, 'dd/MM/yyyy kk:mm'),
              })
            }
          />
        );
      },
    },
    {
      field: 'validTo',
      headerName: 'Valid To',
    },
    {
      field: 'maxUsesPerUser',
      headerName: 'Max Uses Per User',
    },
    {
      field: 'maxUsesTotal',
      headerName: 'Max Uses Total',
    },
    {
      field: 'uses',
      headerName: 'Uses',
    },
  ];

  const addRow = async (data: Coupon) => {
    console.log({ data });
    setAddRowLoading(true);
    const newCoupon = await fetch('/api/coupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const newCouponJson = await newCoupon.json();
    console.log({ newCouponJson });
    setCouponsRows([...couponsRows, newCouponJson]);
    setAddRowLoading(false);
    modal.hide();
    return { id: newCouponJson.id, columnToFocus: undefined };
  };

  const showModal = async () => {
    try {
      const addData = await NiceModal.show('add-coupons');
      return await addRow(addData as Coupon);
    } catch (e) {
      modal.reject(e);
      modal.hide();
      modal.remove();
    }
  };

  return (
    <AdminLayout>
      <AdminTable columns={columns} data={couponsRows} addRow={showModal} />
      <FormModal
        id="add-coupons"
        {...bootstrapDialog(modal)}
        header={'Add Coupon'}
      >
        <CouponsForm plansModel={plansModel} loading={addRowLoading} />
      </FormModal>
    </AdminLayout>
  );
};

export async function getServerSideProps() {
  const coupons = await prisma.coupon.findMany({
    orderBy: {
      validTo: 'desc',
    },
  });
  const plansModel = await prisma.planModel.findMany({
    orderBy: {
      updatedAt: 'asc',
    },
  });
  const serializedCoupons = coupons.map((coupon) => ({
    ...coupon,
    validFrom: format(coupon.validFrom, 'dd/MM/yy kk:mm'),
    validTo: format(coupon.validTo, 'dd/MM/yy kk:mm'),
    createdAt: format(coupon.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(coupon.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  const serializedPlansModel = plansModel.map((planModel) => ({
    ...planModel,
    createdAt: format(planModel.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(planModel.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  return {
    props: {
      coupons: serializedCoupons,
      plansModel: serializedPlansModel,
    },
  };
}

export default Coupons;
