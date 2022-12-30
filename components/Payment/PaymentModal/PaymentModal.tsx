import Image from 'next/image';
import React, { useEffect } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import styles from './PaymentModal.module.scss';

const PaymentModal = ({
  show,
  paymentUrl,
  total,
}: {
  show: boolean;
  paymentUrl: string;
  total: string;
}) => {
  const router = useRouter();
  const handleIframeEvent = (event: MessageEvent) => {
    if (event.data?.includes?.('MeshulamCancelBitPayment')) {
      router.back();
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleIframeEvent);
    return () => window.removeEventListener('message', handleIframeEvent);
  }, []);

  return (
    <Modal show={show} centered className={styles.main} size="xl">
      <Modal.Header className="d-flex justify-content-between position-relative">
        <Modal.Title id="contained-modal-title-vcenter">תשלום</Modal.Title>
        <div>
          <strong>
            לתשלום: {total}
            {'\u20AA'}
          </strong>
        </div>
        <div className={styles.paymentLogo}>
          <Image
            src="/logo-credit-guard.png"
            alt="Payment Solution by Credit Guard"
            width={100}
            height={30}
          />
        </div>
      </Modal.Header>
      <Modal.Body>
        {paymentUrl ? (
          <iframe src={paymentUrl} className={styles.iframe} />
        ) : (
          <Spinner animation="border" style={{ color: '#fff' }} />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;
