import React, { ReactNode } from 'react';
import Head from 'next/head';
import AdminHeader from '../AdminHeader/AdminHeader';
import styles from './AdminLayout.module.scss';

const AdminLayout = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className={styles.main}>
    <Head>
      <title>{title}</title>
    </Head>
    <AdminHeader />
    {children}
  </div>
);

export default AdminLayout;
