import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from '../../../styles/Checkout.module.scss';
import MainLayout from '../../../components/Layouts/MainLayout';

const Checkout = () => {
  const [pageLoading, setPageLoading] = React.useState<boolean>(true);
  const [orderSuccess, setOrderSuccess] = React.useState<boolean>(false);
  const router = useRouter();
  const { status, orderFriendlyId } = router.query;

  useEffect(() => {
    if (status && orderFriendlyId) {
      if (status === 'complete') {
        setOrderSuccess(true);
      }
      setPageLoading(false);
    }
  }, [status, orderFriendlyId]);

  return (
    <MainLayout title="הזמנה" hideJumbotron>
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
              discountType: 'spring',
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
