import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from '../../styles/Checkout.module.scss';
import MainLayout from '../../components/Layouts/MainLayout';

const Checkout = () => {
  const [pageLoading, setPageLoading] = React.useState<boolean>(true);
  const router = useRouter();
  const id = router.query.queryData?.[0];

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
          if (!responseJson.success) {
            await router.push('/error?error=Order');
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
