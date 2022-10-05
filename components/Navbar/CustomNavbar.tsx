import React from 'react';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import Image from "next/image";
import logoImage from '../../public/logoWhite.png'
import styles from './CustomNavbar.module.scss'

const CustomNavbar = () => {
    return (
        <Navbar expand="lg" className={styles.navbar} sticky="top">
            <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        <Nav.Link href="#home">Home</Nav.Link>
                        <Nav.Link href="#link">Link</Nav.Link>
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">
                                Another action
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4">
                                Separated link
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
                <Navbar.Brand href="#home"><Image src={logoImage} alt="Logo image" layout="fixed" width={70} height={35} /></Navbar.Brand>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;
