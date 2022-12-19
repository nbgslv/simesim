import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import Head from 'next/head';
import PaymentModal from '../../components/PaymentModal/PaymentModal';

const Payment = () => {
  const router = useRouter();
  const {
    paymentUrl,
    total,
  }: { paymentUrl?: string; total?: string } = router.query;
  const [showPaymentModal, setShowPaymentModal] = React.useState<boolean>(
    false
  );

  useEffect(() => {
    if (paymentUrl) {
      setShowPaymentModal(true);
    }
  }, [paymentUrl]);

  return (
    <>
      <Head>
        <title>תשלום</title>
      </Head>
      <PaymentModal
        show={showPaymentModal}
        paymentUrl={paymentUrl as string}
        total={total as string}
      />
    </>
  );
};

export default Payment;
