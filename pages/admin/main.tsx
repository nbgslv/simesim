import { NextPageContext } from 'next';
import React from 'react';
import prisma from '../../lib/prisma';
import styles from '../../styles/main.module.scss';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { verifyAdmin } from '../../utils/auth';

const Main = () => (
  <AdminLayout>
    <div className={styles.main}>
      {/* <AdminTable data={lastLines} limit={10} /> */}
    </div>
  </AdminLayout>
);

export async function getServerSideProps(context: NextPageContext) {
  await verifyAdmin(context);
  const lines = await prisma.line.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return {
    props: {
      lastLines: lines || [],
    },
  };
}

export default Main;
