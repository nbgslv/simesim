import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import PaymentModal from '../../components/PaymentModal/PaymentModal';

const Payment = () => {
  const router = useRouter();
  const { paymentUrl }: { paymentUrl?: string } = router.query;
  const [showPaymentModal, setShowPaymentModal] = React.useState<boolean>(
    false
  );

  useEffect(() => {
    if (paymentUrl) {
      setShowPaymentModal(true);
    }
  }, [paymentUrl]);

  return (
    <PaymentModal show={showPaymentModal} paymentUrl={paymentUrl as string} />
  );
};

export default Payment;