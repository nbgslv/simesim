import { Divider } from '@mui/material';
import React from 'react';
import { Plan, Prisma } from '@prisma/client';
import { Spinner } from 'react-bootstrap';
import AdminApi from '../../../utils/api/services/adminApi';
import PaymentData from '../PaymentData/PaymentData';
import PlanModelData from '../PlanModelData/PlanModelData';
import Section, { SectionType } from '../Section';
import UserData from '../UserData/UserData';

export type PlanDataType = Plan &
  Prisma.PlanGetPayload<{
    include: {
      user: {
        include: {
          plans: true;
          payments: true;
          coupons: true;
        };
      };
      payment: {
        include: {
          paymentMethod: true;
        };
      };
      planModel: {
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
      };
    };
  }>;

const PlanData = ({
  plan,
  onDataChange,
}: {
  plan: PlanDataType;
  onDataChange?: (data: Plan | null) => void;
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [adminApi] = React.useState<AdminApi>(new AdminApi());

  if (!plan) return null;

  const data: SectionType<PlanDataType>[] = [
    {
      title: 'Plan',
      id: 'plan',
      data: [
        {
          title: 'ID',
          value: plan.id,
          type: 'text',
        },
        {
          title: 'Friendly ID',
          value: plan.friendlyId,
          type: 'text',
        },
        {
          title: 'Status',
          value: plan.status,
          type: 'select',
          options: [
            {
              value: 'ACTIVE',
              label: 'Active',
            },
            {
              value: 'CANCELLED',
              label: 'Cancelled',
            },
            {
              value: 'PENDING',
              label: 'Pending',
            },
            {
              value: 'EXPIRED',
              label: 'Expired',
            },
          ],
          editable: true,
        },
        {
          title: 'Price',
          value: plan.price,
          type: 'number',
          editable: true,
        },
        {
          title: 'Allow Refill',
          value: plan.allowRefill,
          type: 'boolean',
          editable: true,
        },
        {
          title: 'Created At',
          value: plan.createdAt,
          type: 'date',
        },
        {
          title: 'Updated At',
          value: plan.updatedAt,
          type: 'date',
        },
      ],
    },
  ];

  const handlePlanUpdate = async (updatedPlan: Plan) => {
    try {
      const updatedUserRecord = await adminApi.callApi<
        PlanDataType,
        'update',
        {
          select: {
            user: {
              include: {
                plans: true;
                payments: true;
                coupons: true;
              };
            };
            payment: {
              include: {
                paymentMethod: true;
              };
            };
            planModel: {
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
            };
          };
        }
      >({
        method: 'PUT',
        model: 'User',
        input: {
          where: {
            id: plan.id,
          },
          data: updatedPlan,
          include: {
            user: {
              include: {
                plans: true,
                payments: true,
                coupons: true,
              },
            },
            payment: {
              include: {
                paymentMethod: true,
              },
            },
            planModel: {
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
                coupons: true,
              },
            },
          },
        },
      });
      onDataChange?.(updatedUserRecord);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlanDelete = async () => {
    try {
      await adminApi.callApi<Plan, 'delete'>({
        method: 'DELETE',
        model: 'Plan',
        input: {
          where: {
            id: plan.id,
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
          <Section<PlanDataType>
            sections={data}
            onSave={handlePlanUpdate}
            onDelete={handlePlanDelete}
            setLoading={(value: boolean) => setLoading(value)}
          />
          <h2 className="mt-3">User</h2>
          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.6)' }} />
          <UserData user={plan.user} />
          {plan.payment && (
            <>
              <h2 className="mt-3">Payment</h2>
              <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.6)' }} />
              <PaymentData payment={plan.payment} />
            </>
          )}
          <h2 className="mt-3">Plan Model</h2>
          <Divider sx={{ borderColor: 'rgba(0, 0, 0, 0.6)' }} />
          <PlanModelData planModel={plan.planModel} />
        </>
      )}
    </div>
  );
};

export default PlanData;
