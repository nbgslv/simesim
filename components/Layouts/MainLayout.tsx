import React, { ReactNode, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Fab } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './MainLayout.module.scss';

const MainLayout = ({
  title,
  children,
  hideJumbotron = false,
  metaDescription,
}: {
  title: string;
  children: ReactNode;
  hideJumbotron?: boolean;
  metaDescription?: string;
}) => {
  const [showOrderButton, setShowOrderButton] = React.useState<boolean>(false);
  const router = useRouter();

  const handleScroll = useCallback(() => {
    if (window.scrollY > 1200) {
      setShowOrderButton(true);
    } else {
      setShowOrderButton(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
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
      </Head>
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
