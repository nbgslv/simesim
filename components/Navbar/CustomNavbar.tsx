import React, { RefObject, useEffect, useRef } from 'react';
import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import Image from 'next/image';
import { getSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import logoImageWhiteText from '../../public/logoWhite.png';
import logoImageBlackText from '../../public/logo.png';
import styles from './CustomNavbar.module.scss';
import text from '../../lib/content/text.json';
import { Context, useUserStore } from '../../lib/context/UserStore';
import { Action } from '../../lib/reducer/reducer';

function CustomNavbar({
  background,
  height,
  hideJumbotron = false,
}: {
  background: string | null;
  height: string;
  hideJumbotron: boolean;
}) {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false);
  const { dispatch } = useUserStore() as Context<Action>;
  const navbarRef: RefObject<HTMLElement> = useRef(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session && session.user) {
        dispatch({ type: 'SET_USER', payload: { user: session.user } });
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
        dispatch({ type: 'REMOVE_USER' });
      }
    })();
  }, []);

  useEffect(() => {
    if (navbarRef.current) {
      const navLinks: HTMLCollectionOf<HTMLElement> = (Array.from(
        navbarRef.current.querySelectorAll('a.nav-link')
      ) as unknown) as HTMLCollectionOf<HTMLElement>;
      const dropdowns: HTMLCollectionOf<HTMLElement> = (Array.from(
        navbarRef.current.querySelectorAll('a.dropdown-toggle')
      ) as unknown) as HTMLCollectionOf<HTMLElement>;
      if (background) {
        navbarRef.current.classList.add('bg-light');
        navbarRef.current.classList.remove(styles.withPromo);
        if (Array.isArray(navLinks) && navLinks.length) {
          navLinks.forEach((link: HTMLElement) => {
            link.classList.add(styles.navLinkTextDark);
            link.classList.remove(styles.navLinkTextLight);
          });
        }
        if (Array.isArray(dropdowns) && dropdowns.length) {
          dropdowns.forEach((dropdown: HTMLElement) => {
            dropdown.classList.add(styles.navLinkTextDark);
            dropdown.classList.remove(styles.navLinkTextLight);
          });
        }
      } else {
        navbarRef.current.classList.remove('bg-light');
        navbarRef.current.classList.add(styles.withPromo);
        if (Array.isArray(navLinks) && navLinks.length) {
          navLinks.forEach((link: HTMLElement) => {
            link.classList.add(styles.navLinkTextLight);
            link.classList.remove(styles.navLinkTextDark);
          });
        }
        if (Array.isArray(dropdowns) && dropdowns.length) {
          dropdowns.forEach((dropdown: HTMLElement) => {
            dropdown.classList.add(styles.navLinkTextLight);
            dropdown.classList.remove(styles.navLinkTextDark);
          });
        }
      }
      navbarRef.current.style.height = height;
    }
  }, [background, height, loggedIn]);

  return (
    <Navbar
      expand="lg"
      className={styles.navbar}
      fixed={hideJumbotron ? undefined : 'top'}
      ref={navbarRef}
      collapseOnSelect
    >
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav activeKey={router.pathname} defaultActiveKey="/">
            <Link href="/" passHref>
              <Nav.Link className="d-none">בית</Nav.Link>
            </Link>
            <Link href="/#bundles-section" passHref>
              <Nav.Link>{text.header.navbar.order}</Nav.Link>
            </Link>
            <Link href="/info" passHref>
              <Nav.Link>{text.header.navbar.info}</Nav.Link>
            </Link>
            <Link href="/guide" passHref>
              <Nav.Link>{text.header.navbar.guide}</Nav.Link>
            </Link>
            <Link href="/about" passHref>
              <Nav.Link>{text.header.navbar.about}</Nav.Link>
            </Link>
            <Link href="/contact" passHref>
              <Nav.Link>{text.header.navbar.contact}</Nav.Link>
            </Link>
          </Nav>
          <Nav
            activeKey={router.pathname}
            className={`me-auto ${styles.login}`}
          >
            {loggedIn ? (
              <NavDropdown
                title="אזור אישי"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 1) !important',
                  opacity: '1 !important',
                }}
              >
                <NavDropdown.Item href="/user/orders">הזמנות</NavDropdown.Item>
                <NavDropdown.Item href="/user/changeDetails">
                  עדכון פרטים
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => signOut()}>
                  התנתק
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link href="/login" passHref>
                <Nav.Link>{text.header.navbar.login}</Nav.Link>
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
              width={background ? 53.4 : 65}
              height={32}
            />
          </Navbar.Brand>
        </Link>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
