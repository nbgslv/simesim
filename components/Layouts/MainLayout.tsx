import React, { ReactNode, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { Fab } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Settings } from '@prisma/client';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './MainLayout.module.scss';
import CustomNavbar from '../Navbar/CustomNavbar';
import { Context, useSettingsStore } from '../../lib/context/SettingsStore';
import { Action } from '../../lib/reducer/settingsReducer';
import HeaderRow from '../Header/HeaderRow';

const MainLayout = ({
  title,
  children,
  hideJumbotron = false,
  metaDescription = '',
  metaCanonical = '',
}: {
  title: string;
  children: ReactNode;
  hideJumbotron?: boolean;
  metaDescription?: string;
  metaCanonical?: string;
}) => {
  const [showOrderButton, setShowOrderButton] = React.useState<boolean>(false);
  const { dispatch } = useSettingsStore() as Context<Action>;
  const router = useRouter();

  const handleScroll = useCallback(() => {
    if (window.scrollY > 1200) {
      setShowOrderButton(true);
    } else {
      setShowOrderButton(false);
    }
  }, []);

  const getSettings = useCallback(async () => {
    const res = await fetch('/api/settings');
    const settings: { data: Settings[] } = await res.json();
    dispatch({
      type: 'SET_SETTINGS',
      payload: {
        settings: settings.data.reduce(
          (acc, setting) => ({
            ...acc,
            [setting.name]: setting.value,
          }),
          {}
        ),
      },
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // set and get settings
    getSettings();

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
        {metaCanonical && <link rel="canonical" href={metaCanonical} />}
      </Head>
      <HeaderRow />
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
