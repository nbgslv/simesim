import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from '../../../styles/Checkout.module.scss';
import MainLayout from '../../../components/Layouts/MainLayout';

const Checkout = () => {
  const [pageLoading, setPageLoading] = React.useState<boolean>(true);
  const [orderFriendlyId, setOrderFriendlyId] = React.useState<string>('');
  const [orderSuccess, setOrderSuccess] = React.useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
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
                },
              }),
            }
          );
          const responseJson = await response.json();
          // eslint-disable-next-line no-console
          console.log({ responseJson });
          if (!responseJson.success) {
            if (
              responseJson.name &&
              responseJson.name === 'ORDER_CREATED_WITHOUT_LINE'
            ) {
              setOrderFriendlyId(responseJson.message);
              setOrderSuccess(false);
            } else if (
              responseJson.name &&
              responseJson.name === 'PAYMENT_ALREADY_PROCESSED'
            ) {
              setOrderFriendlyId(responseJson.message);
              setOrderSuccess(true);
            } else {
              await router.push('/error?error=Order');
            }
          } else {
            setOrderFriendlyId(responseJson.data.friendlyId);
            setOrderSuccess(true);
          }
        } catch (error) {
          console.error(error);
          await router.push('/error?error=Order');
        } finally {
          setPageLoading(false);
        }
      })();
    } else {
      router.push('/error?error=Order');
    }
  }, [id]);

  return (
    <MainLayout hideJumbotron>
      {pageLoading ? (
        <div className={styles.main}>
          <Spinner animation="border" role="status" style={{ color: '#000' }} />
        </div>
      ) : (
        <div className={styles.main}>
          {orderSuccess ? (
            <>
              <h1>הזמנתך {orderFriendlyId} נקלטה בהצלחה</h1>
              <p>פרטים מלאים על החבילה שלך ממתינים לך בדוא&quot;ל.</p>
              <p>שתהיה לך נסיעה טובה!</p>
            </>
          ) : (
            <>
              <h1>הזמנתך {orderFriendlyId} נמצאת בתהליך קליטה</h1>
              <p>בסיום התהליך, פרטי החבילה המלאים ישלחו בדוא&quot;ל</p>
              <p>שתהיה לך נסיעה טובה!</p>
            </>
          )}
          <motion.div
            className={styles.qnaImage}
            animate={{ rotate: [0, 45, -45, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              repeatType: 'mirror',
              type: 'spring',
            }}
          >
            <Image
              src={'/plane.svg'}
              alt={'faq'}
              layout="responsive"
              width={500}
              height={300}
            />
          </motion.div>
        </div>
      )}
    </MainLayout>
  );
};

export default Checkout;
