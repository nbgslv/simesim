import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './Checkout.module.scss';
import MainLayout from '../../components/Layouts/MainLayout';

const Checkout = () => {
  const [pageLoading, setPageLoading] = React.useState<boolean>(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      (async () => {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment: {
              status: 'PAID',
              invoice: '123456789', // TODO: generate invoice number/link
              paymentMethod: {
                token: '123456789', // TODO: get from payment gateway, if credit card saved
                cardType: 'VISA', // TODO: get from payment gateway
                expMonth: '12', // TODO: get from payment gateway
                expYear: '2022', // TODO: get from payment gateway
                last4: '1234', // TODO: get from payment gateway
              },
            },
          }),
        });
      })();
      setPageLoading(false);
    }
  }, [id]);

  return (
    <MainLayout hideJumbotron>
      {pageLoading ? (
        <div>
          <Spinner animation="border" role="status" />
        </div>
      ) : (
        <div className={styles.main}>
          <h1>הזמנתך נקלטה בהצלחה</h1>
          <p>פרטים מלאים על החבילה שלך ממתינים לך בדוא&quot;ל.</p>
          <p>שתהיה לך נסיעה טובה!</p>
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
