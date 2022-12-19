import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  GridCellParams,
  GridColumns,
  GridRenderEditCellParams,
  GridRowId,
  GridRowModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import {
  Bundle,
  Line,
  Payment,
  Plan,
  PlanModel,
  Prisma,
  Refill,
  User,
} from '@prisma/client';
import { format } from 'date-fns';
import { NextPageContext } from 'next';
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import AdminSelect from '../../components/AdminSelect/AdminSelect';
import AdminTable from '../../components/AdminTable/AdminTable';
import AdminTableSwitch from '../../components/AdminTable/AdminTableSwitch';
import FormModal from '../../components/AdminTable/FormModal';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminOffcanvas from '../../components/Offcanvas/AdminOffcanvas';
import BundleData from '../../components/Offcanvas/BundleData/BundleData';
import LineData from '../../components/Offcanvas/LineData/LineData';
import PaymentData from '../../components/Offcanvas/PaymentData/PaymentData';
import UserData from '../../components/Offcanvas/UserData/UserData';
import PlansForm from '../../components/Plans/PlansForm';
import RefillsAdminModal from '../../components/Refills/RefillsAdminModal';
import prisma from '../../lib/prisma';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import { verifyAdmin } from '../../utils/auth';

type PlanData = Plan &
  Prisma.PlanGetPayload<{
    select: {
      planModel: {
        include: {
          bundle: true;
          refill: true;
        };
      };
      user: true;
      payment: {
        include: {
          paymentMethod: true;
        };
      };
      line: true;
      bundle: {
        include: {
          refills: true;
        };
      };
    };
  }>;

type PlansAsAdminTableData = (GridValidRowModel & PlanData)[];

type PlansProps = {
  plans: PlansAsAdminTableData;
  plansModel: (PlanModel &
    Prisma.PlanModelGetPayload<{ select: { refill: true } }>)[];
  payments: (Payment & Prisma.PaymentGetPayload<{ select: { user: true } }>)[];
  users: User[];
  lines: Line[];
  bundles: Bundle[];
  refills: Refill[];
};

const Plans = ({
  plans,
  plansModel,
  payments,
  users,
  lines,
  bundles,
  refills,
}: PlansProps) => {
  const [plansRows, setPlansRows] = useState<PlansAsAdminTableData>(plans);
  const [addRowLoading, setAddRowLoading] = useState<boolean>(false);
  const [
    changeAllowRefillLoading,
    setChangeAllowRefillLoading,
  ] = useState<string>('');
  const [lineData, setLineData] = useState<GridRowModel | null>(null);
  const [bundleData, setBundleData] = useState<GridRowModel | null>(null);
  const [refillData, setRefillData] = useState<GridRowModel | null>(null);
  const [userData, setUserData] = useState<GridRowModel | null>(null);
  const [paymentData, setPaymentData] = useState<GridRowModel | null>(null);
  const [adminApi] = useState(new AdminApi());
  const modal = useModal('add-plans');

  const updatePlan = async (
    id: GridRowId,
    data: GridRowModel
  ): Promise<Plan | null> => {
    try {
      const updatedPlan = await adminApi.callApi<
        PlanData,
        'update',
        {
          select: {
            planModel: {
              include: {
                bundle: true;
                refill: true;
              };
            };
            user: true;
            payment: {
              include: {
                paymentMethod: true;
              };
            };
            line: true;
            bundle: {
              include: {
                refills: true;
              };
            };
          };
        }
      >({
        method: 'PUT',
        model: 'Plan',
        input: {
          where: {
            id: data.id,
          },
          data,
          include: {
            planModel: {
              include: {
                bundle: true,
                refill: true,
              },
            },
            user: true,
            payment: {
              include: {
                paymentMethod: true,
              },
            },
            line: true,
            bundle: {
              include: {
                refills: true,
              },
            },
          },
        },
      });
      setPlansRows(
        plansRows.map((plan) => (plan.id === id ? updatedPlan : plan))
      );
      return updatedPlan;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleAllowRefillToggle = async (
    checked: boolean,
    rowId: GridRowId
  ) => {
    try {
      setChangeAllowRefillLoading(rowId as string);
      await updatePlan(rowId, { allowRefill: checked });
    } catch (e) {
      console.error(e);
    } finally {
      setChangeAllowRefillLoading('');
    }
  };

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
    },
    {
      field: 'friendlyId',
      headerName: 'Friendly ID',
    },
    {
      field: 'status',
      headerName: 'Status',
      editable: true,
      type: 'singleSelect',
      valueOptions: ['ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED'],
    },
    {
      field: 'allowRefill',
      headerName: 'Allow Refill',
      renderCell: (params: any) => (
        <AdminTableSwitch
          checked={params.value}
          onChange={handleAllowRefillToggle}
          rowId={params.id}
          row={params.row}
          loading={changeAllowRefillLoading}
        />
      ),
    },
    {
      field: 'line',
      headerName: 'Line',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setLineData(params.row.line)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <AdminSelect
          ariaLabel="select line"
          options={lines.map((line) => ({
            id: line.id,
            label: `${line.iccid}`,
            value: line.id,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={params.row.lineId}
        />
      ),
    },
    {
      field: 'bundle',
      headerName: 'Bundle',
      renderCell: (params: GridCellParams) =>
        params.row.bundle ? (
          <Button onClick={() => setBundleData(params.row.bundle)}>
            <FontAwesomeIcon icon={solid('up-right-from-square')} />
          </Button>
        ) : (
          'N/A'
        ),
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <AdminSelect
          ariaLabel="select bundle"
          options={bundles.map((bundle) => ({
            id: bundle.id,
            label: `${bundle.name}`,
            value: bundle.id,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={params.row.bundleId}
        />
      ),
    },
    {
      field: 'refill',
      headerName: 'Refill',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setRefillData(params.row.planModel.refill)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <AdminSelect
          ariaLabel="select refill"
          options={refills
            .filter((refill) => refill.bundleId === params.row.bundleId)
            .map((refill) => ({
              id: refill.id,
              label: `${refill.title}`,
              value: refill.id,
            }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={params.row.refillId}
        />
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      valueFormatter: ({ value }: { value: string }) =>
        `${parseFloat(value).toFixed(2)}\u20AA`,
    },
    {
      field: 'user',
      headerName: 'User',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setUserData(params.row.user)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      editable: true,
      renderEditCell: (params: GridRenderEditCellParams) => (
        <AdminSelect
          ariaLabel="select user"
          options={users.map((user) => ({
            id: user.id,
            label: `${user.firstName} ${user.lastName}`,
            value: user.id,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={params.row.userId}
        />
      ),
    },
    {
      field: 'payment',
      headerName: 'Payment',
      editable: true,
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setPaymentData(params.row.payment)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      renderEditCell: (params: GridRenderEditCellParams) => (
        <AdminSelect
          ariaLabel="select payment"
          options={payments.map((payment) => ({
            id: payment.id,
            label: `${payment.id}`,
            value: payment.id,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
        />
      ),
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
    await adminApi.callApi<
      PlanData,
      'deleteMany',
      {
        select: {
          planModel: {
            include: {
              bundle: true;
              refill: true;
            };
          };
          user: true;
          payment: {
            include: {
              paymentMethod: true;
            };
          };
          line: true;
          bundle: {
            include: {
              refills: true;
            };
          };
        };
      }
    >({
      method: 'DELETE',
      action: AdminApiAction.deleteMany,
      model: 'Plan',
      input: {
        where: {
          id: {
            in: ids as string[],
          },
        },
      },
    });
    setPlansRows(plansRows.filter((plan) => !ids.includes(plan.id!)));
  };

  const handleDeleteRow = async (id: GridRowId) => {
    await handleDeleteRows([id]);
  };

  const addRow = async (
    data: Plan
  ): Promise<{ id: string; columnToFocus: undefined }> => {
    setAddRowLoading(true);
    const newPlan = await adminApi.callApi<
      PlanData,
      'create',
      {
        select: {
          planModel: {
            include: {
              bundle: true;
              refill: true;
            };
          };
          user: true;
          payment: {
            include: {
              paymentMethod: true;
            };
          };
          line: true;
          bundle: {
            include: {
              refills: true;
            };
          };
        };
      }
    >({
      method: 'POST',
      model: 'Plan',
      input: {
        data,
        include: {
          planModel: {
            include: {
              bundle: true,
              refill: true,
            },
          },
          user: true,
          payment: {
            include: {
              paymentMethod: true,
            },
          },
          line: true,
          bundle: {
            include: {
              refills: true,
            },
          },
        },
      },
    });
    setPlansRows([...plansRows, newPlan]);
    setAddRowLoading(false);
    return { id: newPlan.id, columnToFocus: undefined };
  };

  const showModal = async (): Promise<
    { id: string; columnToFocus: undefined } | Error
  > => {
    try {
      const addData = await NiceModal.show('add-plans');
      return await addRow(addData as Plan);
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      await modal.hide();
      modal.remove();
    }
  };

  const handleRowUpdate = async (
    rowId: GridRowId,
    updatedData: Partial<Plan>
  ): Promise<Plan> =>
    (await updatePlan(rowId, updatedData)) ||
    (plansRows.find((row) => row.id === rowId) as Plan);

  return (
    <AdminLayout title="Plans">
      <AdminTable
        data={plansRows}
        columns={columns}
        addRow={showModal}
        deleteRows={handleDeleteRows}
        processRowUpdate={handleRowUpdate}
        deleteRow={handleDeleteRow}
      />
      <FormModal id="add-plans" {...bootstrapDialog(modal)} header={'Add Plan'}>
        <PlansForm
          plansModel={plansModel}
          payments={payments}
          users={users}
          loading={addRowLoading}
        />
      </FormModal>
      <AdminOffcanvas
        onHide={() => setLineData(null)}
        show={!!lineData}
        title={'Line'}
      >
        <LineData
          line={lineData as Line}
          onDataChange={(updatedLine) => {
            if (updatedLine === null) {
              plansRows.filter((plan) => plan.user.id !== userData?.id);
              setLineData(null);
            } else {
              setLineData(updatedLine);
              setPlansRows(
                plansRows.map((plan) =>
                  plan.line?.id === updatedLine?.id
                    ? { ...plan, line: updatedLine }
                    : plan
                )
              );
            }
          }}
        />
      </AdminOffcanvas>
      <AdminOffcanvas
        onHide={() => setBundleData(null)}
        show={!!bundleData}
        title={'Bundle'}
      >
        <BundleData
          bundle={
            bundleData as Bundle &
              Prisma.BundleGetPayload<{ select: { refills: true } }>
          }
        />
      </AdminOffcanvas>
      <AdminOffcanvas
        show={!!userData}
        title={'User'}
        onHide={() => setUserData(null)}
      >
        <UserData
          user={
            userData as User &
              Prisma.UserGetPayload<{
                select: { plans: true; payments: true; coupons: true };
              }>
          }
          onDataChange={(updatedUser) => {
            if (updatedUser === null) {
              plansRows.filter((plan) => plan.user.id !== userData?.id);
              setUserData(null);
            } else {
              setUserData(updatedUser);
              setPlansRows(
                plansRows.map((plan) =>
                  plan.user.id === updatedUser?.id
                    ? { ...plan, user: updatedUser }
                    : plan
                )
              );
            }
          }}
        />
      </AdminOffcanvas>
      <AdminOffcanvas
        show={!!paymentData}
        title={'Payment'}
        onHide={() => setPaymentData(null)}
      >
        <PaymentData
          payment={
            paymentData as Payment &
              Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>
          }
          onDataChange={(updatedPayment) => {
            if (updatedPayment === null) {
              setPlansRows(
                plansRows.filter((plan) => plan.payment?.id !== paymentData?.id)
              );
              setPaymentData(null);
            } else {
              setPaymentData(paymentData);
              setPlansRows(
                plansRows.map((plan) =>
                  plan.payment?.id === updatedPayment?.id
                    ? { ...plan, payment: updatedPayment }
                    : plan
                )
              );
            }
          }}
        />
      </AdminOffcanvas>
      <RefillsAdminModal
        onHide={() => setRefillData(null)}
        refills={[refillData as Refill]}
        show={!!refillData}
      />
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const plans = await prisma.plan.findMany({
    include: {
      planModel: {
        include: {
          bundle: true,
          refill: true,
        },
      },
      user: true,
      payment: {
        include: {
          paymentMethod: true,
        },
      },
      line: true,
      bundle: {
        include: {
          refills: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  const serializedPlans = plans.map((plan) => ({
    ...plan,
    planModel: {
      ...plan.planModel,
      bundle: {
        ...plan.planModel.bundle,
        createdAt: format(plan.planModel.bundle.createdAt, 'dd/MM/yy kk:mm'),
        updatedAt: format(plan.planModel.bundle.updatedAt, 'dd/MM/yy kk:mm'),
      },
      refill: {
        ...plan.planModel.refill,
        createdAt: format(plan.planModel.refill.createdAt, 'dd/MM/yy kk:mm'),
        updatedAt: format(plan.planModel.refill.updatedAt, 'dd/MM/yy kk:mm'),
      },
      createdAt: format(plan.planModel.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(plan.planModel.updatedAt, 'dd/MM/yy kk:mm'),
    },
    user: {
      ...plan.user,
      emailVerified: plan.user.emailVerified
        ? format(plan.user.emailVerified, 'dd/MM/yy kk:mm')
        : null,
      lastLogin: plan.user.lastLogin
        ? format(plan.user.lastLogin, 'dd/MM/yy kk:mm')
        : null,
      createdAt: format(plan.user.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(plan.user.updatedAt, 'dd/MM/yy kk:mm'),
    },
    payment: {
      ...plan.payment,
      paymentMethod: {
        ...plan.payment?.paymentMethod,
        createdAt: plan.payment?.paymentMethod
          ? format(plan.payment.paymentMethod.createdAt, 'dd/MM/yy kk:mm')
          : null,
        updatedAt: plan.payment?.paymentMethod
          ? format(plan.payment.paymentMethod.updatedAt, 'dd/MM/yy kk:mm')
          : null,
      },
      paymentDate: plan.payment?.paymentDate
        ? format(plan.payment.paymentDate, 'dd/MM/yy kk:mm')
        : null,
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
    bundle: {
      ...plan.bundle,
      refills: plan.bundle.refills.map((refill) => ({
        ...refill,
        createdAt: format(refill.createdAt, 'dd/MM/yy kk:mm'),
        updatedAt: format(refill.updatedAt, 'dd/MM/yy kk:mm'),
      })),
      createdAt: format(plan.planModel.bundle.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(plan.planModel.bundle.updatedAt, 'dd/MM/yy kk:mm'),
    },
    createdAt: format(plan.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(plan.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  const plansModel = await prisma.planModel.findMany({
    include: {
      refill: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
  const serializedPlansModel = plansModel.map((planModel) => ({
    ...planModel,
    refill: {
      ...planModel.refill,
      createdAt: format(planModel.refill.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(planModel.refill.updatedAt, 'dd/MM/yy kk:mm'),
    },
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
        ? format(payment.user.emailVerified, 'dd/MM/yy kk:mm')
        : null,
      lastLogin: payment.user.lastLogin
        ? format(payment.user.lastLogin, 'dd/MM/yy kk:mm')
        : null,
      createdAt: format(payment.user.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(payment.user.updatedAt, 'dd/MM/yy kk:mm'),
    },
    paymentDate: payment.paymentDate
      ? format(payment.paymentDate, 'dd/MM/yy kk:mm')
      : null,
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
      ? format(user.emailVerified, 'dd/MM/yy kk:mm')
      : null,
    lastLogin: user.lastLogin ? format(user.lastLogin, 'dd/MM/yy kk:mm') : null,
    createdAt: format(user.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(user.updatedAt, 'dd/MM/yy kk:mm'),
  }));
  const lines = await prisma.line.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      iccid: true,
    },
  });
  const bundles = await prisma.bundle.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      name: true,
    },
  });
  const refills = await prisma.refill.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      title: true,
      bundleId: true,
    },
  });

  return {
    props: {
      plans: serializedPlans,
      plansModel: serializedPlansModel,
      payments: serializedPayments,
      users: serializedUsers,
      lines,
      bundles,
      refills,
    },
  };
}

export default Plans;
