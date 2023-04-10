import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NextPageContext } from 'next';
import React, { useState } from 'react';
import { Bundle, Line, Prisma, Refill } from '@prisma/client';
import {
  GridCellParams,
  GridColumns,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { format } from 'date-fns';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Button } from 'react-bootstrap';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import AdminOffcanvas from '../../components/Offcanvas/AdminOffcanvas';
import BundleData from '../../components/Offcanvas/BundleData/BundleData';
import PlanData, {
  PlanDataType,
} from '../../components/Offcanvas/PlanData/PlanData';
import RefillsAdminModal from '../../components/Refills/RefillsAdminModal';
import prisma from '../../lib/prisma';
import { verifyAdmin } from '../../utils/auth';
import AdminApi from '../../utils/api/services/adminApi';
import AdminCopy from '../../components/AdminCopy/AdminCopy';
import AdminExpandableCell from '../../components/AdminExpandableCell/AdminExpandableCell';
import styles from '../../styles/lines.module.scss';

type LineData = Line & Prisma.LineGetPayload<{ select: { plan: true } }>;

type LineAsAdminTableData = (GridValidRowModel & LineData)[];

type LinesProps = {
  lines: LineAsAdminTableData;
};

const Lines = ({ lines }: LinesProps) => {
  const [lineRows, setLineRows] = React.useState<LineAsAdminTableData>(lines);
  const [planData, setPlanData] = React.useState<PlanDataType | null>(null);
  const [bundleData, setBundleData] = React.useState<
    (Bundle & Prisma.BundleGetPayload<{ select: { refills: true } }>) | null
  >(null);
  const [refillData, setRefillData] = React.useState<Refill | null>(null);
  const [adminApi] = useState<AdminApi>(new AdminApi());
  const modal = useModal('add-line');

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      renderCell: (params: GridCellParams) => (
        <AdminCopy>{params.value}</AdminCopy>
      ),
      width: 250,
    },
    {
      field: 'iccid',
      headerName: 'ICCID',
      renderCell: (params: GridCellParams) => (
        <AdminCopy>{params.value}</AdminCopy>
      ),
      width: 220,
    },
    {
      field: 'plan',
      headerName: 'Plan',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setPlanData(params.row.plan)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
    },
    {
      field: 'allowedUsageKb',
      headerName: 'Allowed Usage (KB)',
    },
    {
      field: 'remainingUsageKb',
      headerName: 'Remaining Usage (KB)',
    },
    {
      field: 'remainingDays',
      headerName: 'Remaining Days',
    },
    {
      field: 'status',
      headerName: 'Status',
    },
    {
      field: 'bundle',
      headerName: 'Bundle',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setBundleData(params.row.plan.planModel.bundle)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
    },
    {
      field: 'refill',
      headerName: 'Refill',
      renderCell: (params: GridCellParams) => (
        <Button onClick={() => setRefillData(params.row.plan.planModel.refill)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
    },
    {
      field: 'notes',
      headerName: 'Notes',
      renderCell: (params: GridCellParams) => (
        <AdminExpandableCell value={params.value} />
      ),
      width: 200,
      cellClassName: styles.notesCell,
    },
    {
      field: 'autoRefillTurnedOn',
      headerName: 'Auto Refill',
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

  const addRow = async (data: Line) => {
    const newLine = await adminApi.callApi<
      LineData,
      'create',
      {
        select: {
          plan: true;
        };
      }
    >({
      method: 'POST',
      model: 'Line',
      input: {
        data,
        include: {
          plan: true,
        },
      },
    });
    setLineRows([...lineRows, newLine]);
    return { id: newLine.id, columnToFocus: undefined };
  };

  const showModal = async () => {
    try {
      const addData = await NiceModal.show('add-users');
      return await addRow(addData as Line);
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      await modal.hide();
      modal.remove();
    }
  };

  return (
    <AdminLayout title="Lines">
      {/* TODO add new line */}
      <AdminTable
        data={lineRows}
        columns={columns}
        addRow={showModal}
        multiActions={[]}
        rowActions={[]}
      />
      <AdminOffcanvas
        show={!!planData}
        title="Plan"
        onHide={() => setPlanData(null)}
      >
        <PlanData plan={planData as PlanDataType} />
      </AdminOffcanvas>
      <AdminOffcanvas
        show={!!bundleData}
        title="Bundle"
        onHide={() => setBundleData(null)}
      >
        <BundleData bundle={bundleData as Bundle & { refills: Refill[] }} />
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
  const lines = await prisma.line.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      plan: {
        include: {
          user: true,
          payment: true,
          planModel: {
            include: {
              plans: true,
              coupons: true,
            },
          },
          refill: {
            include: {
              bundle: {
                include: {
                  refills: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const serializedLines = lines.map((line) => ({
    ...line,
    plan: line.plan
      ? {
          ...line.plan,
          refill: line.plan.refill
            ? {
                ...line.plan.refill,
                bundle: {
                  ...line.plan.refill.bundle,
                  refills: line.plan.refill.bundle.refills.map((refill) => ({
                    ...refill,
                    createdAt: format(refill.createdAt, 'dd/MM/yy kk:mm'),
                    updatedAt: format(refill.updatedAt, 'dd/MM/yy kk:mm'),
                  })),
                  createdAt: format(
                    line.plan.refill.bundle.createdAt,
                    'dd/MM/yy kk:mm'
                  ),
                  updatedAt: format(
                    line.plan.refill.bundle.updatedAt,
                    'dd/MM/yy kk:mm'
                  ),
                },
                createdAt: format(line.plan.createdAt, 'dd/MM/yy kk:mm'),
                updatedAt: format(line.plan.updatedAt, 'dd/MM/yy kk:mm'),
              }
            : null,
          user: {
            ...line.plan.user,
            lastLogin: line.plan.user.lastLogin
              ? format(line.plan.user.lastLogin, 'dd/MM/yy kk:mm')
              : null,
            emailVerified: line.plan.user.emailVerified
              ? format(line.plan.user.emailVerified, 'dd/MM/yy kk:mm')
              : null,
            createdAt: format(line.plan.user.createdAt, 'dd/MM/yy kk:mm'),
            updatedAt: format(line.plan.user.updatedAt, 'dd/MM/yy kk:mm'),
          },
          payment: line.plan.payment
            ? {
                ...line.plan.payment,
                paymentDate: line.plan.payment.paymentDate
                  ? format(line.plan.payment.paymentDate, 'dd/MM/yy kk:mm')
                  : null,
                createdAt: format(
                  line.plan.payment.createdAt,
                  'dd/MM/yy kk:mm'
                ),
                updatedAt: format(
                  line.plan.payment.updatedAt,
                  'dd/MM/yy kk:mm'
                ),
              }
            : null,
          planModel: {
            ...line.plan.planModel,
            plans: line.plan.planModel.plans.map((plan) => ({
              ...plan,
              createdAt: format(plan.createdAt, 'dd/MM/yy kk:mm'),
              updatedAt: format(plan.updatedAt, 'dd/MM/yy kk:mm'),
            })),
            coupons: line.plan.planModel.coupons.map((coupon) => ({
              ...coupon,
              createdAt: format(coupon.createdAt, 'dd/MM/yy kk:mm'),
              updatedAt: format(coupon.updatedAt, 'dd/MM/yy kk:mm'),
            })),
            createdAt: format(line.plan.planModel.createdAt, 'dd/MM/yy kk:mm'),
            updatedAt: format(line.plan.planModel.updatedAt, 'dd/MM/yy kk:mm'),
          },
          createdAt: line.plan.createdAt
            ? format(line.plan.createdAt, 'dd/MM/yy kk:mm')
            : null,
          updatedAt: line.plan.updatedAt
            ? format(line.plan.updatedAt, 'dd/MM/yy kk:mm')
            : null,
        }
      : null,
    expiredAt: line.expiredAt ? format(line.expiredAt, 'dd/MM/yy kk:mm') : null,
    createdAt: format(line.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(line.updatedAt, 'dd/MM/yy kk:mm'),
  }));

  return {
    props: {
      lines: serializedLines,
    },
  };
}

export default Lines;
