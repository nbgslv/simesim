import React, {RefObject, useEffect, useRef} from 'react';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import Image from "next/image";
import logoImageWhiteText from '../../public/logoWhite.png'
import logoImageBlackText from '../../public/logo.png'
import styles from './CustomNavbar.module.scss'

const CustomNavbar = ({ background, height }: { background: string | null, height: string }) => {
    const navbarRef: RefObject<HTMLElement> = useRef(null)

    useEffect(() => {
        if (navbarRef.current) {
            const navLinks: HTMLCollectionOf<HTMLElement> = Array.from(navbarRef.current.querySelectorAll('a.nav-link')) as unknown as HTMLCollectionOf<HTMLElement>
            if (background) {
                navbarRef.current.classList.add(`bg-light`)
                if (Array.isArray(navLinks) && navLinks.length) {
                    navLinks.forEach((link: HTMLElement) => {
                        link.classList.add(styles.navLinkTextDark)
                        link.classList.remove(styles.navLinkTextLight)
                    })
                }
            } else {
                navbarRef.current.classList.remove(`bg-light`)
                if (Array.isArray(navLinks) && navLinks.length) {
                    navLinks.forEach((link: HTMLElement) => {
                        link.classList.add(styles.navLinkTextLight)
                        link.classList.remove(styles.navLinkTextDark)
                    })
                }
            }
            navbarRef.current.style.height = height
        }
    }, [background, height])

    return (
        <Navbar expand="lg" className={styles.navbar} fixed="top" ref={navbarRef}>
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
                <Navbar.Brand href="#home" className="d-flex justify-content-end" style={{ marginLeft: '0' }}><Image src={background ? logoImageBlackText : logoImageWhiteText} alt="Logo image" layout="fixed" width={65} height={35} /></Navbar.Brand>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;
