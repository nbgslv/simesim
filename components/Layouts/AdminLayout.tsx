import React, { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import AdminHeader from '../AdminHeader/AdminHeader';
import styles from './AdminLayout.module.scss';
import useHideRecaptcha from '../../lib/hooks/useHideRecaptcha';

const AdminLayout = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const { hideRecaptcha } = useHideRecaptcha();

  useEffect(() => {
    hideRecaptcha();
  }, [hideRecaptcha]);

  return (
    <div className={styles.main}>
      <Head>
        <title>{title}</title>
      </Head>
      <AdminHeader />
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
