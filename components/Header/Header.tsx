import React, { useCallback, useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import Image from 'next/image';
import CustomNavbar from '../Navbar/CustomNavbar';
import styles from './Header.module.scss';
import coverImage from '../../public/esimOne.png';
import logoTextWhite from '../../public/logoTextWhite.png';
import text from '../../lib/content/text.json';

const Header = ({ hideJumbotron = false }: { hideJumbotron?: boolean }) => {
  const [navbarBackground, setNavbarBackground] = React.useState<string | null>(
    null
  );
  const [navbarHeight, setNavbarHeight] = React.useState<string>('7rem');

  const handleScroll = useCallback(() => {
    if (window.scrollY > 10 || hideJumbotron) {
      setNavbarBackground('light');
      setNavbarHeight('2.5rem');
    } else {
      setNavbarBackground(null);
      setNavbarHeight('7rem');
    }
  }, [hideJumbotron]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header>
      <div
        className={`d-flex flex-column ${styles.cover}`}
        style={{ height: hideJumbotron ? '100%' : '100vh' }}
      >
        <div className={styles.promo}>
          <div className={styles.textPromo}>
            לזמן מוגבל! 20% הנחה. השתמשו בקופון <u>NEW20</u>
          </div>
        </div>
        <CustomNavbar
          background={navbarBackground}
          height={navbarHeight}
          hideJumbotron={hideJumbotron}
        />
        {!hideJumbotron && (
          <Container className="d-flex mt-auto mb-auto text-center">
            <Row
              className={`d-flex mr-auto justify-content-between align-items-center ${styles.container}`}
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
                <div className="d-flex justify-content-between mt-4">
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
              </Col>
            </Row>
          </Container>
        )}
      </div>
    </header>
  );
};

export default Header;
