import React from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { Payment, Prisma } from '@prisma/client';
import styles from '../AdminTable/FormModal.module.scss';

export interface ExtendedPayment extends Payment {
  friendlyPlanId: string;
}

type PaymentDetailsModalProps = {
  show: boolean;
  handleModalHide: () => void;
  payment:
    | (ExtendedPayment &
        Prisma.PaymentGetPayload<{ select: { paymentMethod: true } }>)
    | null;
};

const PaymentDetailsModal = ({
  show,
  payment,
  handleModalHide,
}: PaymentDetailsModalProps) => {
  if (!payment) return null;

  let paymentStatus;

  switch (payment.status) {
    case 'PENDING':
      paymentStatus = 'ממתין לאישור';
      break;
    case 'PAID':
      paymentStatus = 'שולם';
      break;
    case 'FAILED':
      paymentStatus = 'נכשל';
      break;
    default:
      paymentStatus = 'לא ידוע';
  }

  return (
    <Modal
      show={show}
      onHide={handleModalHide}
      className={styles.main}
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>פרטי תשלום</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col>מספר הזמנה</Col>
            <Col>{payment.friendlyPlanId}</Col>
          </Row>
          <Row>
            <Col>סכום</Col>
            <Col>
              {payment.amount}
              {'\u20AA'}
            </Col>
          </Row>
          <Row>
            <Col>סטטוס</Col>
            <Col>{paymentStatus}</Col>
          </Row>
          <Row>
            <Col>תאריך תשלום</Col>
            <Col>{(payment.paymentDate as unknown) as string}</Col>
          </Row>
          <Row>
            <Col>פרטי אמצעי תשלום</Col>
            {payment.paymentMethod ? (
              <Col>
                <Row>
                  <Col colspan={2}>
                    ****-****-****-{payment.paymentMethod.last4}
                  </Col>
                </Row>
              </Col>
            ) : (
              <Col>טרם התקבל תשלום</Col>
            )}
          </Row>
          <Row>
            <Col>
              <Button
                className="w-100 mt-2"
                variant="primary"
                href={`https://newview.invoice4u.co.il/Views/PDF.aspx?docid=${
                  payment.DocId as string
                }`}
                disabled={!payment.IsDocumentCreated}
              >
                קבלה
              </Button>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentDetailsModal;
