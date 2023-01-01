import { NextPageContext } from 'next';
import React, { useEffect, useState } from 'react';
import { format, parse, parseISO } from 'date-fns';
import { Coupon, PlanModel, Prisma } from '@prisma/client';
import { GridColumns, GridRowId, GridValidRowModel } from '@mui/x-data-grid';
import NiceModal, { bootstrapDialog, useModal } from '@ebay/nice-modal-react';
import { Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminTable from '../../components/AdminTable/AdminTable';
import prisma from '../../lib/prisma';
import FormModal from '../../components/AdminTable/FormModal';
import CouponsForm from '../../components/Coupons/CouponsForm';
import { verifyAdmin } from '../../utils/auth';
import AdminOffcanvas from '../../components/Offcanvas/AdminOffcanvas';
import PlanModelData from '../../components/Offcanvas/PlanModelData/PlanModelData';
import AdminSelect from '../../components/AdminSelect/AdminSelect';
import AdminApi, { AdminApiAction } from '../../utils/api/services/adminApi';

type CouponData = Coupon &
  Prisma.CouponGetPayload<{
    select: {
      planModels: {
        include: {
          bundle: {
            include: {
              refills: true;
            };
          };
          plans: true;
        };
      };
    };
  }>;

type PlanModelDataType = PlanModel &
  Prisma.PlanModelGetPayload<{
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
      plans: true;
      coupons: true;
    };
  }>;

type CouponsAsAdminTableData = (GridValidRowModel & CouponData)[];

const Coupons = ({
  coupons,
  plansModel,
}: {
  coupons: CouponsAsAdminTableData;
  plansModel: (PlanModel &
    Prisma.PlanModelGetPayload<{ select: { refill: true } }>)[];
}) => {
  const [couponsRows, setCouponsRows] = useState<CouponsAsAdminTableData>(
    coupons
  );
  const [addRowLoading, setAddRowLoading] = useState<boolean>(false);
  const [planModelData, setPlanModelData] = useState<PlanModelDataType | null>(
    null
  );
  const [adminApi] = useState<AdminApi>(new AdminApi());
  const modal = useModal('add-coupons');

  useEffect(() => {
    setCouponsRows(coupons);
  }, [coupons]);

  const columns: GridColumns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 250,
    },
    {
      field: 'code',
      headerName: 'Code',
      editable: true,
    },
    {
      field: 'discount',
      headerName: 'Discount',
      valueFormatter: ({ id, value, api }) => {
        const discountType = api.getCellParams(id as GridRowId, 'discountType');
        return `${value}${discountType.value === 'PERCENT' ? '%' : '\u20AA'}`;
      },
      type: 'number',
      editable: true,
    },
    {
      field: 'discountType',
      headerName: 'Type',
      type: 'singleSelect',
      editable: true,
      valueOptions: ['PERCENT', 'AMOUNT'],
    },
    {
      field: 'validFrom',
      headerName: 'Valid From',
      editable: true,
      renderEditCell: (params) => {
        const { id, field, value } = params;
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
      width: 150,
    },
    {
      field: 'validTo',
      headerName: 'Valid To',
      renderEditCell: (params) => {
        const { id, field, value } = params;
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
      width: 150,
    },
    {
      field: 'maxUsesPerUser',
      headerName: 'Max Uses Per User',
      type: 'number',
      editable: true,
    },
    {
      field: 'maxUsesTotal',
      headerName: 'Max Uses Total',
      type: 'number',
      editable: true,
    },
    {
      field: 'uses',
      headerName: 'Uses',
    },
    {
      field: 'planModelId',
      headerName: 'Plan Model',
      renderCell: (params) => (
        <Button
          disabled={!params.row.planModelId}
          onClick={() => setPlanModelData(params.row.planModel)}
        >
          <FontAwesomeIcon icon={solid('up-right-from-square')} />
        </Button>
      ),
      editable: true,
      renderEditCell: (params) => (
        <AdminSelect
          ariaLabel="select bundle"
          options={plansModel.map((planModel) => ({
            value: planModel.id,
            label: planModel.name,
          }))}
          onSelect={(option) => {
            params.api.setEditCellValue({ ...params, value: option?.value });
          }}
          defaultValue={
            params.row.planModelId &&
            params.row.planModel && {
              value: params.row.planModelId,
              label: params.row.planModel.name,
            }
          }
        />
      ),
      width: 200,
    },
  ];

  const handleDeleteRows = async (ids: GridRowId[]) => {
    try {
      await adminApi.callApi<
        CouponData,
        'deleteMany',
        {
          select: {
            planModels: {
              include: {
                bundle: {
                  include: {
                    refills: true;
                  };
                };
                plans: true;
              };
            };
          };
        }
      >({
        method: 'DELETE',
        model: 'Coupon',
        action: AdminApiAction.deleteMany,
        input: {
          where: {
            id: {
              in: ids as string[],
            },
          },
        },
      });
      setCouponsRows((prev) =>
        prev.filter((coupon) => !ids.includes(coupon.id))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRow = async (id: GridRowId) => {
    try {
      await handleDeleteRows([id]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRowUpdate = async (
    rowId: GridRowId,
    updatedData: Partial<Coupon>
  ) => {
    try {
      let updatedRow = { ...updatedData };
      if (updatedRow.validTo) {
        updatedRow = {
          ...updatedRow,
          validTo: parse(
            updatedRow.validTo.toString(),
            'dd/MM/yyyy kk:mm',
            new Date()
          ),
        };
      }
      if (updatedRow.validFrom) {
        updatedRow = {
          ...updatedRow,
          validFrom: parse(
            updatedRow.validFrom.toString(),
            'dd/MM/yyyy kk:mm',
            new Date()
          ),
        };
      }
      const updatedCoupon = await adminApi.callApi<
        CouponData,
        'update',
        {
          select: {
            planModels: {
              include: {
                bundle: {
                  include: {
                    refills: true;
                  };
                };
                plans: true;
              };
            };
          };
        }
      >({
        method: 'PUT',
        model: 'Coupon',
        input: {
          where: {
            id: rowId as string,
          },
          data: updatedRow,
          include: {
            planModels: {
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
                plans: true,
              },
            },
          },
        },
      });
      const serializedCoupon = {
        ...updatedCoupon,
        validFrom: format(
          parseISO(updatedCoupon.validFrom.toString()),
          'dd/MM/yy kk:mm'
        ),
        validTo: format(
          parseISO(updatedCoupon.validTo.toString()),
          'dd/MM/yy kk:mm'
        ),
      };
      // @ts-ignore
      setCouponsRows((prev) =>
        prev.map((coupon) => {
          if (coupon.id === updatedCoupon.id) {
            return serializedCoupon;
          }
          return coupon;
        })
      );
      return { id: updatedCoupon.id, columnToFocus: undefined };
    } catch (error) {
      console.error(error);
      return error as Error;
    }
  };

  const addRow = async (
    data: Coupon
  ): Promise<{ id: string; columnToFocus: undefined }> => {
    setAddRowLoading(true);
    const newCoupon = await adminApi.callApi<
      CouponData,
      'create',
      {
        select: {
          planModels: {
            include: {
              bundle: {
                include: {
                  refills: true;
                };
              };
              plans: true;
            };
          };
        };
      }
    >({
      method: 'POST',
      model: 'Coupon',
      input: {
        data,
        include: {
          planModels: {
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
              plans: true,
            },
          },
        },
      },
    });
    const serializedCoupon = {
      ...newCoupon,
      validFrom: format(
        parseISO(newCoupon.validFrom.toString()),
        'dd/MM/yy kk:mm'
      ),
      validTo: format(parseISO(newCoupon.validTo.toString()), 'dd/MM/yy kk:mm'),
    };
    // @ts-ignore
    setCouponsRows((oldCouponsRows) => [...oldCouponsRows, serializedCoupon]);
    setAddRowLoading(false);
    await modal.hide();
    return { id: newCoupon.id, columnToFocus: undefined };
  };

  const showModal = async (): Promise<
    { id: string; columnToFocus: undefined } | Error
  > => {
    try {
      const addData = await NiceModal.show('add-coupons');
      return await addRow(addData as Coupon);
    } catch (e) {
      modal.reject(e);
      await modal.hide();
      modal.remove();
      return e as Error;
    } finally {
      await modal.hide();
      setAddRowLoading(false);
    }
  };

  return (
    <AdminLayout title="Coupons">
      <AdminTable
        columns={columns}
        data={couponsRows}
        addRow={showModal}
        deleteRows={handleDeleteRows}
        deleteRow={handleDeleteRow}
        processRowUpdate={handleRowUpdate}
      />
      <FormModal
        id="add-coupons"
        {...bootstrapDialog(modal)}
        header={'Add Coupon'}
      >
        <CouponsForm plansModel={plansModel} loading={addRowLoading} />
      </FormModal>
      <AdminOffcanvas
        show={!!planModelData}
        title="Plan Model"
        onHide={() => setPlanModelData(null)}
      >
        <PlanModelData planModel={planModelData as PlanModelDataType} />
      </AdminOffcanvas>
    </AdminLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const coupons = await prisma.coupon.findMany({
    orderBy: {
      validTo: 'desc',
    },
    include: {
      planModels: {
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
          plans: true,
        },
      },
    },
  });
  const plansModel = await prisma.planModel.findMany({
    orderBy: {
      updatedAt: 'asc',
    },
    include: {
      refill: true,
    },
  });
  const serializedCoupons = coupons.map((coupon) => ({
    ...coupon,
    planModels: coupon.planModels.map((planModel) => ({
      ...planModel,
      refill: {
        ...planModel.refill,
        bundle: {
          ...planModel.refill.bundle,
          refills: planModel.refill.bundle.refills.map((refill) => ({
            ...refill,
            createdAt: format(refill.createdAt, 'dd/MM/yyyy kk:mm'),
            updatedAt: format(refill.updatedAt, 'dd/MM/yyyy kk:mm'),
          })),
          createdAt: format(
            planModel.refill.bundle.createdAt,
            'dd/MM/yyyy kk:mm'
          ),
          updatedAt: format(
            planModel.refill.bundle.updatedAt,
            'dd/MM/yyyy kk:mm'
          ),
        },
        createdAt: format(planModel.refill.createdAt, 'dd/MM/yyyy kk:mm'),
        updatedAt: format(planModel.refill.updatedAt, 'dd/MM/yyyy kk:mm'),
      },
      plans: planModel.plans.map((plan) => ({
        ...plan,
        createdAt: format(plan.createdAt, 'dd/MM/yyyy kk:mm'),
        updatedAt: format(plan.updatedAt, 'dd/MM/yyyy kk:mm'),
      })),
      createdAt: format(planModel.createdAt, 'dd/MM/yyyy kk:mm'),
      updatedAt: format(planModel.updatedAt, 'dd/MM/yyyy kk:mm'),
    })),
    validFrom: format(coupon.validFrom, 'dd/MM/yy kk:mm'),
    validTo: format(coupon.validTo, 'dd/MM/yy kk:mm'),
    createdAt: format(coupon.createdAt, 'dd/MM/yy kk:mm'),
    updatedAt: format(coupon.updatedAt, 'dd/MM/yy kk:mm'),
  }));
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
  return {
    props: {
      coupons: serializedCoupons,
      plansModel: serializedPlansModel,
    },
  };
}

export default Coupons;
