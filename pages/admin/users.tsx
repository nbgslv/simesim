import { NextPageContext } from 'next';
import React from 'react';
import { Prisma } from '@prisma/client';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { format } from 'date-fns';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';

type UserAsAdminTableData = (GridValidRowModel &
  Prisma.UserMaxAggregateOutputType)[];

type UsersProps = {
  users: UserAsAdminTableData;
};

const Users = ({ users }: UsersProps) => {
  const [userRows, setUserRows] = React.useState<UserAsAdminTableData>(users);
  const modal = useModal('add-users');

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 250,
    },
    {
      field: 'email',
      headerName: 'Phone',
      editable: true,
    },
    {
      field: 'emailEmail',
      headerName: 'Email',
      width: 200,
      editable: true,
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      editable: true,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      editable: true,
    },
    {
      field: 'plans',
      headerName: 'Plans',
    },
    {
      field: 'payments',
      headerName: 'Payments History',
    },
    {
      field: 'role',
      headerName: 'Role',
      editable: true,
      type: 'singleSelect',
      valueOptions: ['ADMIN', 'USER'],
    },
    {
      field: 'emailVerified',
      headerName: 'Verified',
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
    {
      field: 'lastLogin',
      headerName: 'Last Login',
      width: 150,
    },
  ];

  const addRow = async (data: Prisma.UserMaxAggregateOutputType) => {
    const newUser = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );
    const newUserJson = await newUser.json();
    if (!newUserJson.success) throw new Error('User creation failed');
    setUserRows([...userRows, newUserJson.data]);
    return { id: newUserJson.data.id, columnToFocus: 'firstName' };
  };

  const handleDeleteRows = async (ids: GridRowId[]) => {
    const deleteCount = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      }
    );
    const deleteJson = await deleteCount.json();
    if (!deleteJson.success) throw new Error('User deletion failed');
    setUserRows(userRows.filter((user) => !ids.includes(user.id!)));
  };

  const showModal = async (): Promise<
    Error | { id: GridRowId; columnToFocus: string | undefined }
  > => {
    try {
      const addData = await NiceModal.show('add-users');
      return await addRow(addData as Prisma.UserMaxAggregateOutputType);
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
        data={userRows}
        columns={columns}
        addRow={showModal}
        deleteRows={handleDeleteRows}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const users = await prisma.user.findMany({
    include: {
      payments: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: format(user.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(user.updatedAt, 'dd/MM/yy kk:mm'),
    lastLogin: user.lastLogin ? format(user.lastLogin, 'dd/MM/yy kk:mm') : null,
    emailVerified: user.emailVerified ? 'Yes' : 'No',
  }));

  return {
    props: {
      users: serializedUsers,
    },
  };
}

export default Users;
