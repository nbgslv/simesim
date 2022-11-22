import React, { ReactNode } from 'react';
import AdminHeader from '../AdminHeader/AdminHeader';
import styles from './AdminLayout.module.scss';

const AdminLayout = ({ children }: { children: ReactNode }) => (
  <div className={styles.main}>
    <AdminHeader />
    {children}
  </div>
);

export default AdminLayout;
