import { PhoneBrand } from '@prisma/client';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import styles from './PhoneBrandAdminModal.module.scss';

type PhoneBrandAdminModalProps = {
  onHide: () => void;
  brand: PhoneBrand | null;
  show: boolean;
};

const PhoneBrandAdminModal = ({
  onHide,
  brand,
  show,
}: PhoneBrandAdminModalProps) => {
  if (!brand) return null;
  return (
    <Modal
      show={show}
      onHide={onHide}
      scrollable
      dir="ltr"
      className={styles.main}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Phone Brand</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col className={styles.strong}>Brand Name</Col>
          <Col>{brand.name}</Col>
        </Row>
        <Row>
          <Row>
            <Col className={styles.strong}>Exceptions</Col>
          </Row>
          {brand.exceptions.map((exception: string, i: number) => (
            <Row key={i}>
              <Col>{`\u2022 ${exception}`}</Col>
            </Row>
          ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default PhoneBrandAdminModal;
