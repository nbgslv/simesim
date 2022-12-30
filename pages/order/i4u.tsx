import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PaymentModal from '../../components/Payment/PaymentModal/PaymentModal';

const I4U = () => {
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

export default I4U;
