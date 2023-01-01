import React, { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
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
  const { executeRecaptcha } = useGoogleReCaptcha();

  useEffect(() => {
    if (executeRecaptcha) {
      hideRecaptcha();
    }
  }, [executeRecaptcha]);

  return (
    <div className={styles.main}>
      <Head>
        <title>{title}</title>
      </Head>
      <AdminHeader />
      {children}
    </div>
  );
};

export default AdminLayout;
