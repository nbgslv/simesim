import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import styles from '../../../styles/Checkout.module.scss';
import MainLayout from '../../../components/Layouts/MainLayout';
import { gtagEvent } from '../../../lib/gtag';

const Checkout = () => {
  const router = useRouter();
  const { id, paymentType } = router.query;

  useEffect(() => {
    if (id && paymentType) {
      (async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                payment: {
                  status: 'PAID',
                  paymentType,
                },
              }),
            }
          );
          const responseJson = await response.json();
          if (!responseJson.success) {
            if (
              responseJson.name &&
              responseJson.name === 'ORDER_CREATED_WITHOUT_LINE'
            ) {
              await router.push(
                `${process.env.NEXT_PUBLIC_BASE_URL}/order/complete/success?status=pending&orderFriendlyId=${responseJson.message}`
              );
            } else if (
              responseJson.name &&
              responseJson.name === 'PAYMENT_ALREADY_PROCESSED'
            ) {
              await router.push(
                `${process.env.NEXT_PUBLIC_BASE_URL}/order/complete/success?status=complete&orderFriendlyId=${responseJson.message}`
              );
            } else {
              await router.push('/error?error=Order');
            }
          } else {
            gtagEvent({
              action: 'purchase',
              parameters: {
                currency: 'ILS',
                transaction_id: responseJson.data.id,
                value: responseJson.data.price,
                coupon: responseJson.data.coupon,
                shipping: 0,
                tax: 0,
                items: [
                  {
                    item_id: responseJson.data.items[0].id,
                    item_name: responseJson.data.items[0].name,
                    coupon: responseJson.data.items[0].coupon,
                    discount: responseJson.data.items[0].discount,
                    price: responseJson.data.items[0].price,
                    quantity: responseJson.data.items[0].quantity,
                  },
                ],
              },
            });
            await router.push(
              `${process.env.NEXT_PUBLIC_BASE_URL}/order/complete/success?status=complete&orderFriendlyId=${responseJson.data.friendlyId}`
            );
          }
        } catch (error) {
          console.error(error);
          await router.push('/error?error=Order');
        }
      })();
    }
  }, [id, paymentType]);

  return (
    <MainLayout title="הזמנה" hideJumbotron>
      <div className={styles.main}>
        <Spinner animation="border" role="status" style={{ color: '#000' }} />
      </div>
    </MainLayout>
  );
};

export default Checkout;
