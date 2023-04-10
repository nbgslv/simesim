import { NextPageContext } from 'next';
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Inquiry } from '@prisma/client';
import {
  GridCellParams,
  GridColumns,
  GridRowId,
  GridValidRowModel,
} from '@mui/x-data-grid';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import AdminCopy from '../../components/AdminCopy/AdminCopy';
import AdminExpandableCell from '../../components/AdminExpandableCell/AdminExpandableCell';

type InquiriesAsAdminTableData = (GridValidRowModel & Inquiry)[];

const Inquiries = ({ inquiries }: { inquiries: InquiriesAsAdminTableData }) => {
  const [inquiriesRows, setInquiriesRows] = useState<InquiriesAsAdminTableData>(
    inquiries
  );
  const [adminApi] = useState<AdminApi>(new AdminApi());

  const columns: GridColumns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      renderCell: (params: GridCellParams) => (
        <AdminCopy>{params.value}</AdminCopy>
      ),
      width: 250,
    },
    {
      field: 'message',
      headerName: 'Message',
      renderCell: (params) => <AdminExpandableCell value={params.value} />,
      width: 250,
    },
    {
      field: 'createdAt',
      headerName: 'Received At',
      width: 150,
    },
  ];

  const handleDeleteRows = async (ids: GridRowId[]) => {
    try {
      await adminApi.callApi<Inquiry, 'deleteMany'>({
        method: 'DELETE',
        model: 'Inquiry',
        action: AdminApiAction.deleteMany,
        input: {
          where: { id: { in: ids as string[] } },
        },
      });
      setInquiriesRows((oldInquiries) =>
        oldInquiries.filter((inquiry) => !ids.includes(inquiry.id))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRow = async (id: GridRowId) => {
    try {
      await handleDeleteRows([id]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AdminLayout title="Inquiries">
      <AdminTable
        columns={columns}
        data={inquiriesRows}
        deleteRows={handleDeleteRows}
        deleteRow={handleDeleteRow}
        multiActions={['delete']}
        rowActions={['delete']}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const inquiries = await prisma.inquiry.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      message: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });
  const serializedInquiries = inquiries.map((inquiry) => ({
    ...inquiry,
    createdAt: format(inquiry.createdAt, 'dd/MM/yy kk:mm'),
  }));
  return {
    props: {
      inquiries: serializedInquiries,
    },
  };
}

export default Inquiries;
