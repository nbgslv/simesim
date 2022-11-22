import React from 'react';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import styles from '../AdminTable/FormModal.module.scss';

const PaymentDetailsModal = ({ show, payment, handleModalHide }) => {
  if (!payment) return null;
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
            <Col>{payment.status}</Col>
          </Row>
          <Row>
            <Col>תאריך תשלום</Col>
            <Col>{payment.createdAt}</Col>
          </Row>
          <Row>
            <Col>פרטי אמצעי תשלום</Col>
            {payment.paymentMethod ? (
              <Col>
                <Row>
                  <Col>סוג כרטיס</Col>
                  <Col>{payment.paymentMethod.cardType}</Col>
                </Row>
                <Row>
                  <Col>4 ספרות אחרונות</Col>
                  <Col>{payment.paymentMethod.last4}</Col>
                </Row>
                <Row>
                  <Col>תוקף</Col>
                  <Col>
                    {payment.paymentMethod.expMonth}/
                    {payment.paymentMethod.expYear}
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
                href={payment.invoice}
                disabled={!payment.invoice}
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
