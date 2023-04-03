import React, { useLayoutEffect, useRef } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import Image from 'next/legacy/image';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import Link from 'next/link';
import styles from './Header.module.scss';
import coverImage from '../../public/esimOne.png';
import logoTextWhite from '../../public/logoTextWhite.png';
import text from '../../lib/content/text.json';
import AdvantagePoints from '../AdvantagePoints/AdvantagePoints';
import CloseIcon from '../../public/close.svg';
import { fbpEvent } from '../../lib/fbpixel';
import { gtagEvent } from '../../lib/gtag';

const MotionRow = motion(Row);
const MotionCol = motion(Col);

const Header = ({ hideJumbotron = false }: { hideJumbotron?: boolean }) => {
  const [videoLoading, setVideoLoading] = React.useState(true);
  const [showVideo, setShowVideo] = React.useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('play', () => {
        fbpEvent('ViewContent', {
          content_category: 'header_video',
          content_name: 'play',
        });
        gtagEvent({
          action: 'select_content',
          parameters: {
            content_type: 'header_video',
            content_id: 'play',
          },
        });
      });
      videoRef.current.addEventListener('pause', (event) => {
        fbpEvent('ViewContent', {
          content_category: 'header_video',
          content_name: 'pause',
          value: (event.target as HTMLVideoElement)?.currentTime,
        });
        gtagEvent({
          action: 'select_content',
          parameters: {
            content_type: 'header_video',
            content_id: 'pause',
            value: (event.target as HTMLVideoElement)?.currentTime,
          },
        });
      });
      videoRef.current.addEventListener('loadeddata', () => {
        setVideoLoading(false);
      });
      videoRef.current.addEventListener('ended', () => {
        setShowVideo(false);
        fbpEvent('ViewContent', {
          content_category: 'header_video',
          content_name: 'play_complete',
        });
        gtagEvent({
          action: 'select_content',
          parameters: {
            content_type: 'header_video',
            content_id: 'play_complete',
          },
        });
      });
    }

    return () => {
      videoRef.current?.removeEventListener('loadeddata', () => {
        setVideoLoading(false);
      });
      videoRef.current?.removeEventListener('ended', () => {
        setShowVideo(false);
      });
    };
  }, []);

  return (
    <header>
      <div
        className={`d-flex flex-column ${styles.cover}`}
        style={{ height: '100%' }}
      >
        {!hideJumbotron && (
          <>
            <div className={styles.emptyRow}>
              {!showVideo && (
                <div className="d-flex justify-content-center align-items-center">
                  <Link href="/#bundles-section" passHref legacyBehavior>
                    <Button variant="primary">לחבילות</Button>
                  </Link>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className={styles.playVideoButton}
                      onClick={() => {
                        setShowVideo(true);
                        fbpEvent('ViewContent', {
                          content_category: 'header_video',
                          content_name: 'replay',
                        });
                        gtagEvent({
                          action: 'select_content',
                          parameters: {
                            content_type: 'header_video',
                            content_id: 'replay',
                          },
                        });
                      }}
                    >
                      <FontAwesomeIcon
                        icon={solid('arrow-rotate-back')}
                        style={{ width: '24px', height: '36px' }}
                      />
                    </Button>
                  </motion.div>
                </div>
              )}
              <AnimatePresence>
                {showVideo && (
                  <MotionRow className={styles.videoRow}>
                    {videoLoading && (
                      <div className={styles.spinnerContainer}>
                        <Spinner animation="border" style={{ color: '#000' }} />
                      </div>
                    )}
                    <MotionCol
                      className={`text-center position-relative p-0 ${
                        styles.videoColumn
                      }  ${videoLoading ? 'd-none' : ''}`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        exit={{ opacity: 0 }}
                        className={styles.closeVideoButtonContainer}
                      >
                        <Button
                          onClick={() => {
                            setShowVideo(false);
                            fbpEvent('ViewContent', {
                              content_category: 'header_video',
                              content_name: 'video_closed',
                            });
                            gtagEvent({
                              action: 'select_content',
                              parameters: {
                                content_type: 'header_video',
                                content_id: 'video_closed',
                              },
                            });
                          }}
                          className={styles.closeVideoButton}
                        >
                          <CloseIcon />
                        </Button>
                      </motion.div>
                      {/* @ts-ignore */}
                      <motion.video
                        transition={{
                          height: {
                            duration: 0.4,
                          },
                          opacity: {
                            duration: 0.25,
                            delay: 0.15,
                          },
                        }}
                        exit={{ width: 0, opacity: 0 }}
                        ref={videoRef}
                        width="77.5%"
                        controls
                        autoPlay
                      >
                        <source src="/main.mp4" type="video/mp4" />
                      </motion.video>
                    </MotionCol>
                  </MotionRow>
                )}
              </AnimatePresence>
            </div>
            <Container
              className={`mt-auto mb-auto text-center ${styles.container}`}
            >
              <Row
                className={`d-flex mr-auto justify-content-between align-items-center ${styles.container}`}
                layout="position"
              >
                <Col>
                  <Image
                    alt="תמונת קאבר"
                    src={coverImage}
                    priority
                    className={styles.coverImage}
                  />
                </Col>
                <Col>
                  <div className={styles.callToAction}>
                    <div>
                      <Image
                        src={logoTextWhite}
                        alt="שים eSim"
                        layout="fixed"
                        width={300}
                        height={55}
                        priority
                      />
                    </div>
                    <p className="mt-4">{text.home.coverText}</p>
                    <div className="d-flex justify-content-between mt-4 w-100">
                      <Button
                        variant="primary"
                        className={styles.actionButton}
                        href="/#bundles-section"
                      >
                        {text.home.orderButtonText}
                      </Button>
                      <Button
                        variant="outline-primary"
                        className={styles.actionButtonSecondary}
                        href="/#timeline-section"
                      >
                        {text.home.moreDetailsButtonText}
                      </Button>
                    </div>
                    <Button
                      variant="outline-primary"
                      className={`${styles.actionButtonSecondary} w-100 mt-4`}
                      href="/#check-phone-section"
                    >
                      {text.home.checkPhoneSupport}
                    </Button>
                  </div>
                  <AdvantagePoints />
                </Col>
              </Row>
            </Container>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
