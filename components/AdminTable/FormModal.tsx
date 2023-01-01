import React from 'react';
import { Modal } from 'react-bootstrap';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import styles from './FormModal.module.scss';

type FormModalProps = {
  header: string;
  children: React.ReactNode;
  id: string;
};

export default NiceModal.create(
  ({ header, children, id, ...restProps }: FormModalProps) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const modal = useModal();

    const handleHide = async () => {
      modal.reject();
      await modal.hide();
      modal.remove();
    };
    return (
      <Modal
        {...restProps}
        onHide={handleHide}
        id={id}
        className={styles.main}
        scrollable
        dir="ltr"
        ref={modalRef}
      >
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
      </Modal>
    );
  }
);
