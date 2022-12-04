import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { LegacyRef, useRef } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
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
