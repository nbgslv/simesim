import React from 'react';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import { Plan } from '@prisma/client';
import { Container } from 'react-bootstrap';
import { format } from 'date-fns';
import { authOptions } from '../api/auth/[...nextauth]';
import MainLayout from '../../components/Layouts/MainLayout';
import UserOrders from '../../components/User/UserOrders';
import prisma from '../../lib/prisma';
import styles from '../../styles/orders.module.scss';

const Orders = ({ plans }: { plans: Plan[] }) => (
  <MainLayout hideJumbotron>
    <div className={styles.main}>
      <Container>
        <h1 className="text-center mb-3 p-2">ההזמנות שלי</h1>
        <UserOrders plans={plans} />
      </Container>
    </div>
  </MainLayout>
);

export async function getServerSideProps(context: NextPageContext) {
  const session = await unstable_getServerSession(
    context.req as NextApiRequest,
    context.res as NextApiResponse,
    authOptions(context.req as NextApiRequest, context.res as NextApiResponse)
  );
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  if (session && session.user) {
    const plans = await prisma.plan.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        planModel: true,
        payment: true,
        line: true,
      },
    });
    const serializedPlans = plans.map((plan) => ({
      ...plan,
      createdAt: format(plan.createdAt, 'dd/MM/yy kk:mm'),
      updatedAt: format(plan.updatedAt, 'dd/MM/yy kk:mm'),
      planModel: {
        ...plan.planModel,
        createdAt: plan.planModel
          ? format(plan.planModel.createdAt, 'dd/MM/yy kk:mm')
          : undefined,
        updatedAt: plan.planModel
          ? format(plan.planModel.updatedAt, 'dd/MM/yy kk:mm')
          : undefined,
      },
      payment: {
        ...plan.payment,
        createdAt: plan.payment
          ? format(plan.payment.createdAt, 'dd/MM/yy kk:mm')
          : undefined,
        updatedAt: plan.payment
          ? format(plan.payment.updatedAt, 'dd/MM/yy kk:mm')
          : undefined,
      },
    }));
    return {
      props: {
        plans: serializedPlans,
      },
    };
  }

  return {
    props: {
      plans: [],
    },
  };
}

export default Orders;
