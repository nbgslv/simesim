import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from '@mui/material';
import { NextPageContext } from 'next';
import React, { useState } from 'react';
import { Bundle, Coupon, PlanModel, Prisma, Refill } from '@prisma/client';
import {
  GridCellParams,
  GridColumns,
  GridRowId,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { format } from 'date-fns';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { Button } from 'react-bootstrap';
import AdminSelect from '../../components/AdminSelect/AdminSelect';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import AdminOffcanvas from '../../components/Offcanvas/AdminOffcanvas';
import BundleData from '../../components/Offcanvas/BundleData/BundleData';
import RefillsAdminModal from '../../components/Refills/RefillsAdminModal';
import prisma from '../../lib/prisma';
import AdminTableSwitch from '../../components/AdminTable/AdminTableSwitch';
import FormModal from '../../components/AdminTable/FormModal';
import PlansModelForm from '../../components/PlansModel/PlansModelForm';
import styles from '../../styles/bundles.module.scss';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';
import { verifyAdmin } from '../../utils/auth';

type PlanModelData = PlanModel &
  Prisma.PlanModelGetPayload<{
    include: {
      refill: { include: { bundle: { include: { refills: true } } } };
    };
  }>;

type PlansModelAsAdminTableData = (GridValidRowModel & PlanModelData)[];

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
  const [addPlanModelLoading, setAddPlanModelLoading] = useState(false);
  const [plansRows, setPlansRows] = React.useState<PlansModelAsAdminTableData>(
    plansModel
  );
  const [vatToggleLoading, setVatToggleLoading] = React.useState<GridRowId>('');
  const [bundleData, setBundleData] = React.useState<Bundle | null>(null);
  const [refillData, setRefillData] = React.useState<Refill | null>(null);
  const [adminApi] = useState<AdminApi>(new AdminApi());
  const modal = useModal('add-plansmodel');

  const handleVatToggle = async (checked: boolean, rowId: GridRowId) => {
    try {
      setVatToggleLoading(rowId);
      const update = await adminApi.callApi<
        PlanModelData,
        'update',
        {
          include: {
            refill: {
              include: {
                bundle: {
                  include: {
                    refills: true;
                  };
                };
              };
            };
          };
        }
      >({
        method: 'PUT',
        model: 'PlanModel',
        input: {
          where: {
            id: rowId as string,
          },
          data: {
            vat: checked,
          },
        },
      });
      setPlansRows(
        plansRows.map((plan) => (plan.id === rowId ? update : plan))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setVatToggleLoading('');
    }
  };

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 220,
    },
    {
      field: 'bundle',
      headerName: 'Bundle',
      renderCell: (params) => (
        <Button onClick={() => setBundleData(params.row.refill.bundle)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      renderEditCell: (params) => (
        <AdminSelect
          ariaLabel="select bundle"
          options={existingBundles.map((bundle) => ({
            value: bundle.id,
            label: bundle.name,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={existingBundles.reduce(
            (acc, bundle) =>
              bundle.id === params.row.refill.bundleId
                ? { value: bundle.id, label: bundle.name }
                : acc,
            { value: '', label: '' }
          )}
        />
      ),
      width: 150,
      editable: true,
    },
    {
      field: 'refill',
      headerName: 'Refill',
      renderCell: (params) => (
        <Button onClick={() => setRefillData(params.row.refill)}>
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      renderEditCell: (params) => (
        <AdminSelect
          ariaLabel="select refill"
          options={existingRefills
            .filter((refill) => refill.bundleId === params.row.bundleId)
            .map((refill) => ({
              value: refill.id,
              label: refill.title,
            }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={existingRefills.reduce(
            (acc, refill) =>
              refill.id === params.row.refillId
                ? { value: refill.id, label: refill.title }
                : acc,
            { value: '', label: '' }
          )}
        />
      ),
      width: 150,
      editable: true,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      editable: true,
    },
    {
      field: 'description',
      headerName: 'Description',
      renderCell: (params: GridCellParams) => (
        <Tooltip title={params.value}>
          <span className={styles.tooltip}>{params.value}</span>
        </Tooltip>
      ),
      editable: true,
      width: 200,
    },
    {
      field: 'price',
      headerName: 'Price',
      editable: true,
      width: 70,
      type: 'number',
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
      renderCell: () => (
        <Button>
          <FontAwesomeIcon icon={solid('arrow-up')} />
        </Button>
      ),
      renderEditCell: (params) => (
        <AdminSelect<true>
          isMulti
          ariaLabel="select coupons"
          options={existingCoupons.map((coupon) => ({
            value: coupon.id,
            label: `${coupon.code} - ${coupon.discount}${
              coupon.discountType === 'PERCENT' ? '%' : '\u20AA'
            }`,
          }))}
          value={params.row.coupons.map((coupon: Coupon) => ({
            value: coupon.id,
            label: `${coupon.code} - ${coupon.discount}${
              coupon.discountType === 'PERCENT' ? '%' : '\u20AA'
            }`,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option });
          }}
          defaultValue={params.row.coupons}
        />
      ),
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
    data: PlanModel & {
      couponsIds?: string[];
      coupons: { connect: { id: string }[] };
    }
  ): Promise<{ id: GridRowId; columnToFocus: undefined } | Error> => {
    setAddPlanModelLoading(true);
    const newPlanModel = await adminApi.callApi<
      PlanModelData,
      'create',
      {
        include: {
          refill: {
            include: {
              bundle: {
                include: {
                  refills: true;
                };
              };
            };
          };
        };
      }
    >({
      method: 'POST',
      model: 'PlanModel',
      input: {
        data,
        include: {
          refill: {
            include: {
              bundle: {
                include: {
                  refills: true,
                },
              },
            },
          },
          coupons: true,
        },
      },
    });
    setPlansRows([...plansRows, newPlanModel]);
    return { id: newPlanModel.id, columnToFocus: undefined };
  };

  const handleDeleteRows = async (ids: GridRowId[]) => {
    await adminApi.callApi<PlanModelData, 'deleteMany'>({
      method: 'DELETE',
      action: AdminApiAction.deleteMany,
      model: 'PlanModel',
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

  const showModal = async (): Promise<
    Error | { id: GridRowId; columnToFocus: string | undefined }
  > => {
    try {
      const addData = await NiceModal.show('add-plansmodel');
      return await addRow(
        addData as PlanModelData & {
          couponsIds?: string[];
          coupons: { connect: { id: string }[] };
        }
      );
    } catch (e) {
      modal.reject(e);
      return e as Error;
    } finally {
      await modal.hide();
      modal.remove();
      setAddPlanModelLoading(false);
    }
  };

  const handleRowUpdate = async (
    rowId: GridRowId,
    updatedData: Partial<PlanModel>
  ): Promise<PlanModel> =>
    adminApi.callApi<
      PlanModelData,
      'update',
      {
        include: {
          refill: {
            include: {
              bundle: {
                include: {
                  refills: true;
                };
              };
            };
          };
        };
      }
    >({
      method: 'PUT',
      model: 'PlanModel',
      input: {
        where: { id: rowId as string },
        data: updatedData,
        include: {
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
    });

  const handleDeleteRow = async (id: GridRowId) => {
    await handleDeleteRows([id as string]);
  };

  return (
    <AdminLayout title="Plans Model">
      <AdminTable
        data={plansRows}
        columns={columns}
        addRow={showModal}
        deleteRows={handleDeleteRows}
        processRowUpdate={handleRowUpdate}
        deleteRow={handleDeleteRow}
      />
      <FormModal
        id="add-plansmodel"
        {...bootstrapDialog(modal)}
        header={'Add Plan Model'}
      >
        <PlansModelForm
          bundles={existingBundles}
          refills={existingRefills}
          coupons={existingCoupons}
          loading={addPlanModelLoading}
        />
      </FormModal>
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
  const plansModel = await prisma.planModel.findMany({
    include: {
      refill: {
        include: {
          bundle: {
            include: { refills: true },
          },
        },
      },
      coupons: true,
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
    refill: {
      ...planModel.refill,
      createdAt: format(planModel.refill.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(planModel.refill.updatedAt, 'dd/MM/yy kk:mm'),
      bundle: {
        ...planModel.refill.bundle,
        refills: planModel.refill.bundle.refills.map((refill) => ({
          ...refill,
          createdAt: format(refill.createdAt, 'dd/MM/yy kk:mm'),
          updatedAt: format(refill.updatedAt, 'dd/MM/yy kk:mm'),
        })),
        createdAt: format(planModel.refill.bundle.createdAt, 'dd/MM/yy kk:mm'),
        updatedAt: format(planModel.refill.bundle.updatedAt, 'dd/MM/yy kk:mm'),
      },
    },
    coupons: planModel.coupons.map((coupon) => ({
      ...coupon,
      validFrom: format(coupon.validFrom, 'dd/MM/yy kk:mm'),
      validTo: format(coupon.validTo, 'dd/MM/yy kk:mm'),
      createdAt: format(coupon.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(coupon.updatedAt, 'dd/MM/yy kk:mm'),
    })),
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
