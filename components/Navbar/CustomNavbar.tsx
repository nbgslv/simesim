import React, {RefObject, useEffect, useRef} from 'react';
import {Container, Nav, Navbar, NavDropdown} from "react-bootstrap";
import Image from "next/image";
import logoImageWhiteText from '../../public/logoWhite.png'
import logoImageBlackText from '../../public/logo.png'
import styles from './CustomNavbar.module.scss'
import text from '../../lib/content/text.json';
import {useSession} from "next-auth/react";
import Link from "next/link";

const CustomNavbar = ({ background, height, hideJumbotron = false }: { background: string | null, height: string, hideJumbotron: boolean }) => {
    const { status } = useSession()
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
        <Navbar expand="lg" className={styles.navbar} fixed={hideJumbotron ? undefined : "top"} ref={navbarRef}>
            <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav defaultActiveKey="/">
                        <Link href="/" passHref>
                            <Nav.Link className="d-none" eventKey="/">בית</Nav.Link>
                        </Link>
                        <Link href="/#bundles-section" passHref>
                            <Nav.Link eventKey="bundles-section">{text.header.navbar.order}</Nav.Link>
                        </Link>
                        <Link href="/info" passHref>
                            <Nav.Link eventKey="info">{text.header.navbar.info}</Nav.Link>
                        </Link>
                        <Link href="/guide" passHref>
                            <Nav.Link eventKey="guide">{text.header.navbar.guide}</Nav.Link>
                        </Link>
                        <Link href="/about" passHref>
                            <Nav.Link eventKey="about">{text.header.navbar.about}</Nav.Link>
                        </Link>
                        <Link href="/contact" passHref>
                            <Nav.Link eventKey="contact">{text.header.navbar.contact}</Nav.Link>
                        </Link>
                    </Nav>
                    <Nav className={`me-auto ${styles.login}`}>
                        {status === 'authenticated' ? (
                            <NavDropdown title="אזור אישי">
                                <NavDropdown.Item href="#action/3.1">הזמנות</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">הגדרות</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="/api/auth/signout">התנתק</NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Link href="/login" passHref>
                                <Nav.Link eventKey="login">{text.header.navbar.login}</Nav.Link>
                            </Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
                <Link href="/" passHref>
                    <Navbar.Brand
                        href="/"
                        className="d-flex justify-content-end"
                        style={{ marginLeft: '0' }}
                    >
                        <Image
                            src={background ? logoImageBlackText : logoImageWhiteText}
                            alt="Logo image"
                            layout="fixed"
                            width={65}
                            height={35}
                        />
                    </Navbar.Brand>
                </Link>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;
