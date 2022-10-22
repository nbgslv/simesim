import React from 'react';
import {Col, Container, Row, Nav, Navbar} from "react-bootstrap";
import styles from './Footer.module.scss';
import Image from "next/image";
import logoImageWhiteText from "../../public/logoWhite.png";

const Footer = () => {
    return (
        <footer className={styles.main}>
            <Container>
                <Row>
                    <Col>
                        <h1>שים eSim</h1>
                        <Nav className="flex-column">
                            <Nav.Item>
                                <Nav.Link>A</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link>A</Nav.Link>
                            </Nav.Item>
                        </Nav>
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
                    <Col>
                        <Navbar.Brand href="#home" className="d-flex justify-content-end" style={{ marginLeft: '0' }}><Image src={logoImageWhiteText} alt="Logo image" layout="fixed" width={70} height={35} /></Navbar.Brand>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
