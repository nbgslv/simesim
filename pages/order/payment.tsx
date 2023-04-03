import React from 'react';
import PaymentGate from '../../components/Payment/PaymentGate/PaymentGate';
import MainLayout from '../../components/Layouts/MainLayout';
import styles from '../../styles/payment.module.scss';

const Payment = () => (
  <MainLayout title="תשלום" hideJumbotron>
    <div className={styles.main}>
      <PaymentGate />
    </div>
  </MainLayout>
);

export default Payment;
