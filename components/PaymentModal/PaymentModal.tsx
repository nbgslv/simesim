import { useRouter } from 'next/router';
import React, { LegacyRef, useRef } from 'react';
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
  const iframeRef: LegacyRef<HTMLIFrameElement> = useRef(null);

  const handleIframeSrcChane = async () => {
    if (iframeRef.current) {
      const iframeUrl = iframeRef.current.contentWindow?.location.href;
      // eslint-disable-next-line no-console
      console.log({ iframeUrl });
      if (iframeUrl && iframeUrl !== paymentUrl) {
        await router.push(iframeUrl);
      }
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
            ref={iframeRef}
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
