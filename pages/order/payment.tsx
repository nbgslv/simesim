import React from 'react';
import PaymentGate from '../../components/Payment/PaymentGate/PaymentGate';
import MainLayout from '../../components/Layouts/MainLayout';

const Payment = () => (
  <MainLayout title="תשלום" hideJumbotron>
    <PaymentGate />
  </MainLayout>
);

export default Payment;
