import React from 'react';
import {Col, Container, Row, Nav} from "react-bootstrap";
import styles from './Footer.module.scss';
import Image from "next/image";
import logoImageWhiteText from "../../public/logoWhite.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {brands, regular} from "@fortawesome/fontawesome-svg-core/import.macro";

const Footer = () => {
    return (
        <footer className={styles.main}>
            <Container>
                <Row>
                    <Col>
                        <h1>שים eSim</h1>
                        <p className={styles.footerDescription}>
                            שים eSim מציעה ללקוחותיה רכישה של כרטיס סים(sim) ווירטואלי. לכרטיסי הסים הווירטואליים חבילות גלישה זולות בנפחי גלישה שונים.
                        </p>
                    </Col>
                    <Col>
                        <Nav className="flex-column">
                            <Nav.Item>
                                <Nav.Link>A</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link>A</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link>A</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>
                    <Col className="d-flex flex-column justify-content-between">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <Image src={logoImageWhiteText} alt="Logo image" layout="fixed" width={70} height={35} />
                            </div>
                            <div className={styles.copyright}>
                                <small>כל הזכויות שמורות <FontAwesomeIcon icon={regular('copyright')} /></small>
                            </div>
                        </div>
                        <div className="d-flex flex-column justify-content-between">
                            <div>
                                <FontAwesomeIcon icon={regular('envelope')} />
                            </div>
                            <div>
                                <FontAwesomeIcon icon={brands('whatsapp')} />
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
