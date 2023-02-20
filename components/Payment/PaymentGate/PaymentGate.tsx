import React, { useEffect } from 'react';
import { Button, Col, Container, Image, Row, Spinner } from 'react-bootstrap';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useRouter } from 'next/router';
import styles from './PaymentGate.module.scss';
import { gtagEvent } from '../../../lib/gtag';
import { OrderData } from '../../../pages/api/order/[id]';

enum PaymentType {
  PAYPAL = 'PAYPAL',
  CREDIT_CARD = 'CREDIT_CARD',
  BIT = 'BIT',
}

const PaymentGate = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [orderData, setOrderData] = React.useState<OrderData | null>(null);
  const [{ isPending }] = usePayPalScriptReducer();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        if (router.query.orderId) {
          const order = await fetch(`/api/order/${router.query.orderId}`);
          const orderJson = await order.json();
          setOrderData(orderJson.data);
        }
      } catch (error) {
        console.error(error);
        await router.push('/error?error=Order');
      }
    })();
  }, [router.query.orderId]);

  useEffect(() => {
    if (router.query.orderId && !isPending && orderData) {
      gtagEvent({
        action: 'begin_checkout',
        parameters: {
          currency: 'ILS',
          value: orderData.price,
          coupon: orderData.coupon,
          items: [
            {
              item_id: orderData.items[0].id,
              item_name: orderData.items[0].name,
              coupon: orderData.items[0].coupon,
              discount: orderData.items[0].discount,
              price: orderData.items[0].price,
              quantity: orderData.items[0].quantity,
            },
          ],
        },
      });
      setLoading(false);
    }
  }, [router.query.orderId, isPending, orderData]);

  const handlePaymentSelect = async (paymentMethod: PaymentType) => {
    try {
      if (router.query.orderId) {
        setLoading(true);
        const res = await fetch(
          `/api/order/payment?paymentType=${paymentMethod}&orderId=${encodeURI(
            router.query.orderId as string
          )}`
        );
        if (res.redirected) {
          await router.push(res.url);
        }
      }
    } catch (error) {
      console.error(error);
      await router.push('/error?error=Payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className={`text-center d-flex flex-column justify-content-center ${styles.container}`}
    >
      <h1 className="mb-5">3. בוחרים איך לשלם</h1>
      {loading ? (
        <Spinner className="ms-auto me-auto" animation={'border'} />
      ) : (
        <>
          {orderData && orderData.price >= 1 && (
            <Row>
              <Col>
                <Button
                  onClick={() => handlePaymentSelect(PaymentType.BIT)}
                  disabled={loading}
                  className={styles.button}
                >
                  Bit{' '}
                  <Image
                    src="/Bit_logo.svg"
                    alt="pay with bit"
                    height={18}
                    className={styles.bitLogo}
                  />
                </Button>
              </Col>
            </Row>
          )}
          <Row className={`mt-2 mb-2 ${styles.row}`}>
            <Col>
              <Button
                onClick={() => handlePaymentSelect(PaymentType.CREDIT_CARD)}
                disabled={loading}
                className={styles.button}
              >
                כרטיס אשראי
                <FontAwesomeIcon
                  icon={solid('credit-card')}
                  style={{ height: '1rem' }}
                  className="me-2"
                />
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <PayPalButtons
                disabled={loading}
                createOrder={async () => {
                  const order = await fetch(
                    `/api/order/payment/paypal/create`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        orderId: router.query.orderId,
                      }),
                    }
                  );
                  const orderJson = await order.json();
                  return orderJson.data.token;
                }}
                onApprove={async (data) => {
                  const res = await fetch(`/api/order/payment/paypal/capture`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      orderId: router.query.orderId,
                      payerId: data.payerID,
                      paymentId: data.paymentID,
                    }),
                  });
                  const resJson = await res.json();
                  if (resJson.success) {
                    await router.push(
                      `/order/complete/success?status=complete&orderFriendlyId=${resJson.data.friendlyId}`
                    );
                  } else if (
                    !resJson.success &&
                    resJson.name === 'ORDER_CREATED_WITHOUT_LINE'
                  ) {
                    await router.push(
                      `/order/complete/success?status=pending&orderFriendlyId=${resJson.message}`
                    );
                  } else {
                    await router.push('/error?error=Order');
                  }
                }}
              />
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default PaymentGate;
