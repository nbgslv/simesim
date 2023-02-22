import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import Image from 'next/image';
import styles from './Header.module.scss';
import coverImage from '../../public/esimOne.png';
import logoTextWhite from '../../public/logoTextWhite.png';
import text from '../../lib/content/text.json';
import AdvantagePoints from '../AdvantagePoints/AdvantagePoints';

const Header = ({ hideJumbotron = false }: { hideJumbotron?: boolean }) => (
  <header>
    <div
      className={`d-flex flex-column ${styles.cover}`}
      style={{ height: hideJumbotron ? '100%' : '100vh' }}
    >
      {!hideJumbotron && (
        <Container className="d-flex mt-auto mb-auto text-center">
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
      )}
    </div>
  </header>
);

export default Header;
