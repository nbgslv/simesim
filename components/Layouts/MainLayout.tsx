import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Fab } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Settings } from '@prisma/client';
import { useCookies } from 'react-cookie';
import { isMobile } from 'react-device-detect';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import styles from './MainLayout.module.scss';
import CustomNavbar from '../Navbar/CustomNavbar';
import { Context, useSettingsStore } from '../../lib/context/SettingsStore';
import { Action } from '../../lib/reducer/settingsReducer';
import HeaderRow from '../Header/HeaderRow';
import ExitIntent from '../ExitIntent/ExitIntent';
import ExitIntentModal from '../ExitIntent/ExitIntentModal';
import useMobileExitIntent from '../ExitIntent/MobileExitIntent';
import ClientOnly from '../ClientOnly/ClientOnly';
import useIdle from '../../lib/hooks/useIdle';
import IdleIntentModal from '../IdleIntent/IdleIntentModal';
import useTitleFlash from '../../lib/hooks/useTitleFlash';

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
  const [showOrderButton, setShowOrderButton] = React.useState<boolean>(false);
  const [showExitIntentPopup, setShowExitIntentPopup] = useState(false);
  const [showIdlePopup, setShowIdlePopup] = useState(false);
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
  const [cookies, _, removeCookie] = useCookies(['exitModalSeen']);
  const { dispatch } = useSettingsStore() as Context<Action>;
  const isIdle = useIdle(10000);
  const { setFlash, flash } = useTitleFlash('אתם עדיין כאן?');
  useMobileExitIntent({
    callback: () => {
      if (
        (!cookies.exitModalSeen || cookies.exitModalSeen !== 'true') &&
        isMobile
      ) {
        setShowExitIntentPopup(true);
      }
    },
  });

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
      !isMobile &&
      showExitIntent
    ) {
      const removeExitIntent = ExitIntent({
        threshold: 30,
        eventThrottle: 100,
        onExitIntent: () => {
          if (!router.query.coupon && !showIdlePopup) {
            setShowExitIntentPopup(true);
          }
        },
      });
      return () => {
        removeExitIntent();
      };
    }

    return () => {};
  }, [cookies.exitModalSeen]);

  useEffect(() => {
    if (
      (!cookies.exitModalSeen || cookies.exitModalSeen !== 'true') &&
      isIdle &&
      !showExitIntentPopup
    ) {
      setShowIdlePopup(true);
      setFlash(true);
    }
  }, [isIdle]);

  useEffect(() => {
    if (flash && !showIdlePopup) {
      setFlash(false);
    }
  }, [showIdlePopup, flash]);

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
      <ClientOnly>
        <ExitIntentModal
          hide={() => setShowExitIntentPopup(false)}
          show={showExitIntentPopup}
        />
        <IdleIntentModal
          show={showIdlePopup}
          hide={() => setShowIdlePopup(false)}
        />
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
      </ClientOnly>
    </>
  );
};

export default MainLayout;
