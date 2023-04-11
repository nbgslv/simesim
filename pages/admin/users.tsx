import { NextPageContext } from 'next';
import React from 'react';
import { Prisma, User } from '@prisma/client';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import { format } from 'date-fns';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';
import FormModal from '../../components/AdminTable/FormModal';
import UsersForm from '../../components/Users/UsersForm';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import AdminCopy from '../../components/AdminCopy/AdminCopy';

type UserData = User &
  Prisma.UserGetPayload<{
    select: {
      payments: true;
      coupons: {
        include: {
          coupon: true;
        };
      };
    };
  }>;

type UserAsAdminTableData = (GridValidRowModel & UserData)[];

type UsersProps = {
  users: UserAsAdminTableData;
};

const Users = ({ users }: UsersProps) => {
  const [userRows, setUserRows] = React.useState<UserAsAdminTableData>(users);
  const [addRowLoading, setAddRowLoading] = React.useState<boolean>(false);
  const [adminApi] = React.useState<AdminApi>(new AdminApi());
  const modal = useModal('add-users');

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      renderCell: (params) => <AdminCopy value={params.value} />,
      width: 250,
    },
    {
      field: 'email',
      headerName: 'Phone',
      align: 'right',
      renderCell: (params) => <AdminCopy value={params.value} />,
      editable: true,
      width: 120,
    },
    {
      field: 'emailEmail',
      headerName: 'Email',
      renderCell: (params) => <AdminCopy value={params.value} />,
      width: 250,
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
      renderCell: () => (
        <Button>
          <FontAwesomeIcon icon={solid('arrow-up')} />
        </Button>
      ),
    },
    {
      field: 'payments',
      headerName: 'Payments History',
      renderCell: () => (
        <Button>
          <FontAwesomeIcon icon={solid('arrow-up')} />
        </Button>
      ),
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
      valueFormatter: ({ value }) => (value ? 'Yes' : 'No'),
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

  const handleRowUpdate = async (
    rowId: GridRowId,
    updatedData: Partial<User>
  ): Promise<UserData> => {
    const update = await adminApi.callApi<
      UserData,
      'update',
      {
        select: {
          payments: true;
          coupons: {
            include: {
              coupon: true;
            };
          };
        };
      }
    >({
      method: 'PUT',
      model: 'User',
      input: {
        where: { id: rowId as string },
        data: updatedData,
        include: {
          payments: true,
          coupons: {
            include: {
              coupon: true,
            },
          },
        },
      },
    });
    setUserRows((oldUsers) =>
      oldUsers.map((user) => (user.id === rowId ? update : user))
    );
    return update;
  };

  const handleDeleteRows = async (ids: GridRowId[]) => {
    await adminApi.callApi<
      UserData,
      'deleteMany',
      {
        select: {
          payments: true;
          coupons: {
            include: {
              coupon: true;
            };
          };
        };
      }
    >({
      method: 'DELETE',
      model: 'User',
      action: AdminApiAction.deleteMany,
      input: {
        where: {
          id: {
            in: ids as string[],
          },
        },
      },
    });
    setUserRows(userRows.filter((user) => !ids.includes(user.id!)));
  };

  const handleDeleteRow = async (id: GridRowId) => {
    await handleDeleteRows([id]);
  };

  const addRow = async (data: User) => {
    setAddRowLoading(true);
    const newUser = await adminApi.callApi<
      UserData,
      'create',
      {
        select: {
          payments: true;
          coupons: {
            include: {
              coupon: true;
            };
          };
        };
      }
    >({
      method: 'POST',
      model: 'User',
      input: {
        data,
        include: {
          payments: true,
          coupons: {
            include: {
              coupon: true,
            },
          },
        },
      },
    });
    setUserRows([...userRows, newUser]);
    setAddRowLoading(false);
    return { id: newUser.id, columnToFocus: undefined };
  };

  const showModal = async (): Promise<
    { id: string; columnToFocus: undefined } | Error
  > => {
    try {
      const addData = await NiceModal.show('add-users');
      return await addRow(addData as User);
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      await modal.hide();
      modal.remove();
    }
  };

  return (
    <AdminLayout title="Users">
      <AdminTable
        data={userRows}
        columns={columns}
        addRow={showModal}
        deleteRows={handleDeleteRows}
        deleteRow={handleDeleteRow}
        processRowUpdate={handleRowUpdate}
      />
      <FormModal {...bootstrapDialog(modal)} id="add-users" header="Add User">
        <UsersForm loading={addRowLoading} />
      </FormModal>
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const users = await prisma.user.findMany({
    include: {
      payments: true,
      coupons: {
        include: {
          coupon: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const serializedUsers = users.map((user) => ({
    ...user,
    payments: user.payments.map((payment) => ({
      ...payment,
      paymentDate: payment.paymentDate
        ? format(payment.paymentDate, 'dd/MM/yy kk:mm')
        : null,
      createdAt: format(payment.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(payment.updatedAt, 'dd/MM/yy kk:mm'),
    })),
    coupons: user.coupons.map((coupon) => ({
      ...coupon.coupon,
      createdAt: format(coupon.coupon.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(coupon.coupon.updatedAt, 'dd/MM/yy kk:mm'),
      validFrom: format(coupon.coupon.validFrom, 'dd/MM/yy kk:mm'),
      validTo: format(coupon.coupon.validTo, 'dd/MM/yy kk:mm'),
    })),
    createdAt: format(user.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(user.updatedAt, 'dd/MM/yy kk:mm'),
    lastLogin: user.lastLogin ? format(user.lastLogin, 'dd/MM/yy kk:mm') : null,
    emailVerified: user.emailVerified
      ? format(user.emailVerified, 'dd/MM/yy kk:mm')
      : null,
  }));

  return {
    props: {
      users: serializedUsers,
    },
  };
}

export default Users;
