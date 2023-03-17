import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Fab } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './MainLayout.module.scss';
import CustomNavbar from '../Navbar/CustomNavbar';
import ExitIntent from '../ExitIntent/ExitIntent';
import ExitIntentModal from '../ExitIntent/ExitIntentModal';

const MainLayout = ({
  title,
  children,
  hideJumbotron = false,
  metaDescription = '',
  metaCanonical = '',
  showExitIntent = false,
}: {
  title: string;
  children: ReactNode;
  hideJumbotron?: boolean;
  metaDescription?: string;
  metaCanonical?: string;
  showExitIntent?: boolean;
}) => {
  const [showOrderButton, setShowOrderButton] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState(false);
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
  const [cookies, _, removeCookie] = useCookies(['exitModalSeen']);
  const router = useRouter();

  const handleScroll = useCallback(() => {
    if (window.scrollY > 1200) {
      setShowOrderButton(true);
    } else {
      setShowOrderButton(false);
    }
  }, []);

  useEffect(() => {
    if (
      (!cookies.exitModalSeen || cookies.exitModalSeen !== 'true') &&
      showExitIntent
    ) {
      const removeExitIntent = ExitIntent({
        threshold: 30,
        eventThrottle: 100,
        onExitIntent: () => {
          setShowPopup(true);
        },
      });
      return () => {
        removeExitIntent();
      };
    }

    return () => {};
  }, [cookies.exitModalSeen]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      removeCookie('exitModalSeen');
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        {metaDescription && (
          <meta name="description" content={metaDescription} />
        )}
        {metaCanonical && <link rel="canonical" href={metaCanonical} />}
      </Head>
      <ExitIntentModal hide={() => setShowPopup(false)} show={showPopup} />
      <div className={styles.promo}>
        <div className={styles.textPromo}>
          לזמן מוגבל! 20% הנחה. השתמשו בקופון <u>NEW20</u>
        </div>
      </div>
      <CustomNavbar />
      <Header hideJumbotron={hideJumbotron} />
      <main>{children}</main>
      <AnimatePresence>
        {showOrderButton && router.pathname === '/' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Fab
              href="/#bundles-section"
              color="primary"
              aria-label="order"
              className={styles.fabOrder}
            >
              לחבילות
            </Fab>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </>
  );
};

export default MainLayout;
