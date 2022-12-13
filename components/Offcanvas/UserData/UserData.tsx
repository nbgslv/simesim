import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode } from 'react';
import { Prisma, User } from '@prisma/client';
import { Button, Spinner } from 'react-bootstrap';
import AdminApi from '../../../utils/api/services/adminApi';
import Section, { SectionType } from '../Section';

const UserData = ({
  user,
  onDataChange,
}: {
  user: User &
    Prisma.UserGetPayload<{
      select: { plans: true; payments: true; coupons: true };
    }>;
  onDataChange?: (data: User | null) => void;
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [adminApi] = React.useState<AdminApi>(new AdminApi());

  if (!user) return null;

  const data: SectionType<
    User &
      Prisma.UserGetPayload<{
        select: { plans: true; payments: true; coupons: true };
      }>
  >[] = [
    {
      title: 'Private Data',
      id: 'private',
      data: [
        {
          title: 'ID',
          value: user.id,
          type: 'text',
        },
        {
          title: 'Phone',
          value: user.email,
          type: 'text',
          editable: true,
        },
        {
          title: 'Email',
          value: user.emailEmail,
          type: 'text',
          editable: true,
        },
        {
          title: 'First Name',
          value: user.firstName || 'N/A',
          type: 'text',
          editable: true,
        },
        {
          title: 'Last Name',
          value: user.lastName || 'N/A',
          type: 'text',
          editable: true,
        },
      ],
    },
    {
      title: 'System Data',
      id: 'system',
      data: [
        {
          title: 'Creation Date',
          value: user.createdAt,
          type: 'date',
        },
        {
          title: 'Last Updated',
          value: user.updatedAt,
          type: 'date',
        },
        {
          title: 'Last Login',
          value: user.lastLogin || 'N/A',
          type: 'date',
        },
        {
          title: 'Role',
          value: user.role,
          type: 'select',
          options: [
            { value: 'USER', label: 'User' },
            { value: 'ADMIN', label: 'Admin' },
          ],
          editable: true,
        },
      ],
    },
    {
      title: 'User Activity',
      id: 'activity',
      data: [
        {
          title: 'Plans',
          value: user.plans,
          type: 'text',
          RenderData: (): ReactNode => {
            const [showPlansModal, setShowPlansModal] = React.useState<boolean>(
              false
            );
            return (
              <Button onClick={() => setShowPlansModal(true)}>
                <FontAwesomeIcon icon={solid('up-right-from-square')} />
              </Button>
            );
          },
        },
        {
          title: 'Payments',
          value: user.payments,
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
          value: user.coupons,
          type: 'text',
          RenderData: (): ReactNode => {
            const [
              showCouponsModal,
              setShowCouponsModal,
            ] = React.useState<boolean>(false);
            return (
              <Button onClick={() => setShowCouponsModal(true)}>
                <FontAwesomeIcon icon={solid('up-right-from-square')} />
              </Button>
            );
          },
        },
      ],
    },
  ];

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const updatedUserRecord = await adminApi.callApi<
        User &
          Prisma.UserGetPayload<{
            select: { plans: true; payments: true; coupons: true };
          }>,
        'update',
        { select: { plans: true; payments: true; coupons: true } }
      >({
        method: 'PUT',
        model: 'User',
        input: {
          where: {
            id: user.id,
          },
          data: updatedUser,
          include: {
            plans: true,
            payments: true,
            coupons: true,
          },
        },
      });
      onDataChange?.(updatedUserRecord);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserDelete = async () => {
    try {
      await adminApi.callApi<User, 'delete'>({
        method: 'DELETE',
        model: 'User',
        input: {
          where: {
            id: user.id,
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
        <Section<
          User &
            Prisma.UserGetPayload<{
              select: { plans: true; payments: true; coupons: true };
            }>
        >
          sections={data}
          onSave={handleUserUpdate}
          onDelete={handleUserDelete}
          setLoading={(value: boolean) => setLoading(value)}
        />
      )}
    </div>
  );
};

export default UserData;
