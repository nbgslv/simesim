import React from 'react';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import { Prisma } from '@prisma/client';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import prisma from '../../lib/prisma';
import { format } from 'date-fns';
import FormModal from '../../components/AdminTable/FormModal';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';

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
    },
    {
      field: 'email',
      headerName: 'Email',
    },
    {
      field: 'name',
      headerName: 'Name',
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
      field: 'phone',
      headerName: 'Phone',
      editable: true,
    },
    {
      field: 'Payment',
      headerName: 'Payment',
    },
    {
      field: 'createdAt',
      headerName: 'Created At',
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
    },
    {
      field: 'lastLogin',
      headerName: 'Last Login',
    },
  ];

  const addRow = async (data: Prisma.UserMaxAggregateOutputType) => {
    const newUser = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const newUserJson = await newUser.json();
    console.log({ newUser });
    setUserRows([...userRows, newUserJson]);
    return { id: newUserJson.id, columnToFocus: 'firstName' };
  };

  const handleDeleteRows = async (ids: GridRowId[]) => {
    const deleteCount = await fetch('/api/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });
    await deleteCount.json();
    setUserRows(userRows.filter((user) => !ids.includes(user.id!)));
  };

  const showModal = async () => {
    try {
      const addData = await NiceModal.show('add-users');
      return addRow(addData as Prisma.UserMaxAggregateOutputType);
    } catch (e) {
      modal.reject(e);
      modal.hide();
      modal.remove();
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
      <FormModal
        id="add-user"
        {...bootstrapDialog(modal)}
        header={'Add New User'}
      ></FormModal>
    </AdminLayout>
  );
};

export async function getServerSideProps() {
  const users = await prisma.user.findMany({
    include: {
      Payment: true,
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
  }));

  return {
    props: {
      users: serializedUsers,
    },
  };
}

export default Users;
