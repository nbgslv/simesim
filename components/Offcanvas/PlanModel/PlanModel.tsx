import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider } from '@mui/material';
import React, { ReactNode } from 'react';
import { PlanModel, Prisma } from '@prisma/client';
import { Button, Spinner } from 'react-bootstrap';
import AdminApi from '../../../utils/api/services/adminApi';
import BundleData from '../BundleData/BundleData';
import Section, { SectionType } from '../Section';

export type PlanModelDataType = PlanModel &
  Prisma.PlanModelGetPayload<{
    select: {
      bundle: {
        include: {
          refills: true;
        };
      };
      plans: true;
      coupons: true;
    };
  }>;

const PlanModelData = ({
  planModel,
  onDataChange,
}: {
  planModel: PlanModelDataType;
  onDataChange?: (data: PlanModel | null) => void;
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [adminApi] = React.useState<AdminApi>(new AdminApi());

  if (!planModel) return null;

  const data: SectionType<PlanModelDataType>[] = [
    {
      title: 'Plan Model',
      id: 'plan-model',
      data: [
        {
          title: 'ID',
          value: planModel.id,
          type: 'text',
        },
        {
          title: 'Name',
          value: planModel.name,
          type: 'text',
          editable: true,
        },
        {
          title: 'Description',
          value: planModel.description || 'N/A',
          type: 'text',
          editable: true,
        },
        {
          title: 'Price',
          value: planModel.price,
          type: 'number',
          editable: true,
        },
        {
          title: 'VAT',
          value: planModel.vat,
          type: 'boolean',
          editable: true,
        },
        {
          title: 'Created At',
          value: planModel.createdAt,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: planModel.updatedAt,
          type: 'date',
        },
      ],
    },
    {
      title: 'Connections',
      id: 'connections',
      data: [
        {
          title: 'Plans',
          value: planModel.plans,
          type: 'text',
          RenderData: (): ReactNode => {
            const [
              showPaymentsModal,
              setShowPaymentsModal,
            ] = React.useState<boolean>(false);
            return (
              <Button onClick={() => setShowPaymentsModal(true)}>
                <FontAwesomeIcon icon={solid('up-right-from-square')} />
              </Button>
            );
          },
        },
        {
          title: 'Coupons',
          value: planModel.coupons,
          type: 'text',
          RenderData: (): ReactNode => {
            const [
              showPaymentsModal,
              setShowPaymentsModal,
            ] = React.useState<boolean>(false);
            return (
              <Button onClick={() => setShowPaymentsModal(true)}>
                <FontAwesomeIcon icon={solid('up-right-from-square')} />
              </Button>
            );
          },
        },
      ],
    },
  ];

  const handlePlanUpdate = async (updatedPlanModel: PlanModel) => {
    try {
      const updatedPlanModelRecord = await adminApi.callApi<
        PlanModelDataType,
        'update',
        {
          select: {
            bundle: {
              include: {
                refills: true;
              };
            };
            plans: true;
            coupons: true;
          };
        }
      >({
        method: 'PUT',
        model: 'User',
        input: {
          where: {
            id: planModel.id,
          },
          data: updatedPlanModel,
          include: {
            plans: true,
            coupons: true,
            bundle: {
              include: {
                refills: true,
              },
            },
          },
        },
      });
      onDataChange?.(updatedPlanModelRecord);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlanDelete = async () => {
    try {
      await adminApi.callApi<PlanModel, 'delete'>({
        method: 'DELETE',
        model: 'PlanModel',
        input: {
          where: {
            id: planModel.id,
          },
        },
      });
      onDataChange?.(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-100 h-100">
      {loading ? (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <>
          <Section<PlanModelDataType>
            sections={data}
            onSave={handlePlanUpdate}
            onDelete={handlePlanDelete}
            setLoading={(value: boolean) => setLoading(value)}
          />
          <h2 className="mt-3">Bundle</h2>
          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.6)' }} />
          <BundleData bundle={planModel.bundle} />
        </>
      )}
    </div>
  );
};

export default PlanModelData;
