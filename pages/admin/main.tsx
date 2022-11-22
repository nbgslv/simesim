import React from 'react';
import prisma from '../../lib/prisma';
import AdminTable from '../../components/AdminTable/AdminTable';
import styles from '../../styles/main.module.scss';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../api/auth/[...nextauth]';

const Main = ({ lastLines }) => {
  return (
    <AdminLayout>
      <div className={styles.main}>
        {/*<AdminTable data={lastLines} limit={10} />*/}
      </div>
    </AdminLayout>
  );
};

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req as NextApiRequest,
    context.res as NextApiResponse,
    authOptions(context.req as NextApiRequest, context.res as NextApiResponse)
  );
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  } else if (session && session.user) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    if (user && user.role !== 'ADMIN') {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    const lines = await prisma.line.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return {
      props: {
        lastLines: lines,
      },
    };
  }
}

export default Main;
