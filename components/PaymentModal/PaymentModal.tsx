import { useRouter } from 'next/router';
import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import styles from './PaymentModal.module.scss';

const PaymentModal = ({
  show,
  paymentUrl,
}: {
  show: boolean;
  paymentUrl: string;
}) => {
  const router = useRouter();

  const handleIframeSrcChane = async (
    e: React.ChangeEvent<HTMLIFrameElement>
  ) => {
    if (e.target.src !== paymentUrl) {
      await router.push(e.target.src);
    }
  };

  return (
    <Modal show={show} centered className={styles.main} size="xl">
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">תשלום</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {paymentUrl ? (
          <iframe
            src={paymentUrl}
            onLoad={handleIframeSrcChane}
            className={styles.iframe}
          />
        ) : (
          <Spinner animation="border" style={{ color: '#fff' }} />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;