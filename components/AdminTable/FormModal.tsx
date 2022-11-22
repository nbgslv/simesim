import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import styles from './FormModal.module.scss';
import NiceModal, { useModal } from '@ebay/nice-modal-react';

type FormModalProps = {
  header: string;
  children: React.ReactNode;
  id: string;
};

export default NiceModal.create(
  ({ header, children, id, ...restProps }: FormModalProps) => {
    const modal = useModal();

    const handleHide = () => {
      modal.reject();
      modal.hide();
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
      >
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
      </Modal>
    );
  }
);
