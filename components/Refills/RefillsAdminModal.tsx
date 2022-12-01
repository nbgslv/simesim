import { Refill } from '@prisma/client';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import styles from './RefillsAdminModal.module.scss';

type RefillsAdminModalProps = {
  onHide: () => void;
  refills: Refill[];
  show: boolean;
};

const RefillsAdminModal = ({
  onHide,
  refills,
  show,
}: RefillsAdminModalProps) => {
  console.log({ refills });
  if (!refills || refills.length === 0) return null;
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
        <Modal.Title>Bundle&apos;s Refills</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {refills.length > 0 ? (
          <Col>
            {refills.map((refill: Refill) => (
              <Row key={refill.id}>
                <Col>{refill.title}</Col>
                <Col>MB: {refill.amount_mb}</Col>
                <Col>Days: {refill.amount_days}</Col>
                <Col>
                  Price: {refill.price_usd}$ / {refill.price_eur}€
                </Col>
              </Row>
            ))}
          </Col>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default RefillsAdminModal;
