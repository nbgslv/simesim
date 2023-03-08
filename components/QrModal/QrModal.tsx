import React from 'react';
import Image from 'next/legacy/image';
import { Col, Container, Modal, Row } from 'react-bootstrap';
import styles from '../AdminTable/FormModal.module.scss';

type QrModalProps = {
  show: boolean;
  handleModalHide: () => void;
  qrCode: string | null;
};

const QrModal = ({ show, qrCode, handleModalHide }: QrModalProps) => {
  if (!qrCode) return null;

  return (
    <Modal
      show={show}
      onHide={handleModalHide}
      className={styles.main}
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>קוד QR</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>
              <strong>הוראות</strong>
            </Col>
          </Row>
          <Row>
            <Col>
              1. פותחים את המצלמה בטלפון או אפליקצייה ייעודית לסריקת קוד QR
            </Col>
          </Row>
          <Row>
            <Col>2. סורקים את הקוד</Col>
          </Row>
          <Row>
            <Col>3. עוקבים אחר ההוראות המוצגות בטלפון</Col>
          </Row>
          <Row className="d-flex mt-4 justify-content-center">
            <Image
              src={qrCode}
              layout="intrinsic"
              width={150}
              height={150}
              alt="Qr Code"
            />
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default QrModal;
