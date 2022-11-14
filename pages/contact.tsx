import React from 'react';
import MainLayout from "../components/Layouts/MainLayout";
import text from '../lib/content/text.json';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {brands, regular} from "@fortawesome/fontawesome-svg-core/import.macro";
import {Col, Container, Nav, Row} from 'react-bootstrap';
import styles from '../styles/contact.module.scss';

const Contact = () => {
    return (
        <MainLayout hideJumbotron>
            <div className={styles.main}>
                <h1 className="text-center p-2">{text.contact.title}</h1>
                <Container className="h-75 d-flex flex-column justify-content-center">
                    <div className="">
                        <div>
                            <p>{text.contact.description}</p>
                        </div>
                        <div className={styles.container}>
                            <Row className="d-flex align-items-center">
                                <Col lg={1} className={styles.iconWrapper}>
                                    <FontAwesomeIcon className={styles.iconContainer} icon={brands('whatsapp')} />
                                </Col>
                                <Col>
                                    <Nav.Link href="https://wa.me/054123456">054123456</Nav.Link>
                                </Col>
                            </Row>
                            <Row className="d-flex align-items-center w-auto">
                                <Col lg={1} className={styles.iconWrapper}>
                                    <FontAwesomeIcon className={styles.iconContainer} icon={regular('envelope')} />
                                </Col>
                                <Col>
                                    <Nav.Link href="mailto:service@simesim.co.il">service@simesim.co.il</Nav.Link>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </Container>
            </div>
        </MainLayout>
    );
};

export default Contact;
