import React from 'react';
import { Col, Container, Row, Nav } from 'react-bootstrap';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  brands,
  regular,
} from '@fortawesome/fontawesome-svg-core/import.macro';
import logoImageWhiteText from '../../public/logoWhite.png';
import styles from './Footer.module.scss';
import text from '../../lib/content/text.json';

const Footer = () => (
  <footer className={styles.main}>
    <Container className="h-100 d-flex flex-column justify-content-between">
      <Row className={styles.row}>
        <Col className="m-auto">
          <Image
            src={'/logoTextWhite.png'}
            alt="שים eSim"
            height={46}
            width={250}
          />
          <p className={styles.footerDescription}>
            שים eSim מציעה ללקוחותיה רכישה של כרטיס סים(sim) ווירטואלי. לכרטיסי
            הסים הווירטואליים חבילות גלישה זולות בנפחי גלישה שונים.
          </p>
        </Col>
        <Col>
          <Nav className="flex-column">
            <Nav.Item>
              <Nav.Link href="/#bundles-section">
                {text.header.navbar.order}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/info">{text.header.navbar.info}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/guide">{text.header.navbar.guide}</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col>
          <Nav className="flex-column">
            <Nav.Item>
              <Nav.Link href="#">{text.header.navbar.about}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/contact">{text.header.navbar.contact}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/terms">
                {text.header.navbar.privacyPolicy}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href="/a11y">
                {text.header.navbar.accessibility}
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col className="d-flex flex-column justify-content-between">
          <div
            className={`d-flex align-items-center justify-content-between ${styles.logo}`}
          >
            <div>
              <Image
                src={logoImageWhiteText}
                alt="Logo image"
                layout="fixed"
                width={70}
                height={35}
              />
            </div>
          </div>
          <div className="d-flex flex-column justify-content-between">
            <div className={`d-flex align-items-center ${styles.logo}`}>
              <FontAwesomeIcon icon={regular('envelope')} />
              <Nav.Link href={`mailto:${text.email}`}>{text.email}</Nav.Link>
            </div>
            <div className={`d-flex align-items-center ${styles.logo}`}>
              <FontAwesomeIcon icon={brands('whatsapp')} />
              <Nav.Link href={`https://wa.me/${text.phoneNumber}`}>
                {text.phoneNumber}
              </Nav.Link>
            </div>
            <div className={`d-flex justify-content-start mt-1 ${styles.logo}`}>
              <Nav.Link
                href="https://www.facebook.com/profile.php?id=100088126987688"
                target="_blank"
                className="p-0 ms-2"
                aria-label="Facebook"
              >
                <FontAwesomeIcon
                  icon={brands('facebook')}
                  aria-label="Facebook"
                />
              </Nav.Link>
              <Nav.Link
                href="https://www.instagram.com/simesim.co.il/"
                target="_blank"
                className="p-0"
                aria-label="Instagram"
              >
                <FontAwesomeIcon
                  icon={brands('instagram')}
                  aria-label="Instagram"
                />
              </Nav.Link>
            </div>
          </div>
        </Col>
      </Row>
      <Row className={styles.badges}>
        {/* <Col md={1} className="text-center"> */}
        {/*  <table */}
        {/*    width="135" */}
        {/*    border={0} */}
        {/*    cellPadding="2" */}
        {/*    cellSpacing="0" */}
        {/*    title="Click to Verify - This site chose DigiCert SSL for secure e-commerce and confidential communications." */}
        {/*  > */}
        {/*    <tr> */}
        {/*      <td width="135" align="center" valign="top"> */}
        {/*        <Script */}
        {/*          type="text/javascript" */}
        {/*          src="https://seal.websecurity.norton.com/getseal?host_name=www.simesim.co.il&amp;size=M&amp;use_flash=NO&amp;use_transparent=Yes&amp;lang=en" */}
        {/*        /> */}
        {/*        <br /> */}
        {/*        <a */}
        {/*          href="https://www.digicert.com/what-is-ssl-tls-https/" */}
        {/*          target="_blank" */}
        {/*          style={{ */}
        {/*            color: '#ffffff', */}
        {/*            textDecoration: 'none', */}
        {/*            font: 'bold 10px verdana,sans-serif', */}
        {/*            textAlign: 'center', */}
        {/*            margin: '0px', */}
        {/*            padding: '0px', */}
        {/*          }} */}
        {/*          rel="noreferrer" */}
        {/*        > */}
        {/*          {' '} */}
        {/*          How SSL Secures You */}
        {/*        </a> */}
        {/*      </td> */}
        {/*    </tr> */}
        {/*  </table> */}
        {/* </Col> */}
        <Col md={1}>
          <Image
            alt="Provides grow credit card solutions"
            src={'/grow-logo.svg'}
            width={85}
            height={40}
          />
        </Col>
        <Col md={1}>
          <Image
            alt="Allows payment with BIT"
            src={'/Bit_logo.svg'}
            width={40}
            height={40}
          />
        </Col>
        <Col md={1}>
          <Image
            alt="Allows payment with paypal"
            src={'/paypal.png'}
            width={63.125}
            height={40}
          />
        </Col>
        <Col md={1}>
          <Image
            alt="Accepts Visa credit cards"
            src={'/visa.png'}
            width={63.125}
            height={40}
          />
        </Col>
        <Col md={1}>
          <Image
            alt="Accepts Mastercard credit cards"
            src={'/mastercard.png'}
            width={63.125}
            height={40}
          />
        </Col>
        <Col md={1}>
          <Image
            alt="Protected by PCI standard"
            src={'/pci-dss.png'}
            width={40}
            height={40}
          />
        </Col>
      </Row>
      <Row className="text-center">
        <Col>
          <small>
            כל הזכויות שמורות <FontAwesomeIcon icon={regular('copyright')} />
          </small>
        </Col>
      </Row>
    </Container>
  </footer>
);

export default Footer;
