import React, { RefObject, useEffect, useRef } from 'react';
import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import Image from 'next/image';
import { getSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as Sentry from '@sentry/nextjs';
import logoImageBlackText from '../../public/logo.png';
import styles from './CustomNavbar.module.scss';
import text from '../../lib/content/text.json';
import { Context, useUserStore } from '../../lib/context/UserStore';
import { Action } from '../../lib/reducer/reducer';

function CustomNavbar() {
  const [loggedIn, setLoggedIn] = React.useState<boolean>(false);
  const { dispatch } = useUserStore() as Context<Action>;
  const navbarRef: RefObject<HTMLElement> = useRef(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session && session.user) {
        Sentry.setUser({
          id: session.user.id,
          username: session.user.email,
          email: session.user.emailEmail,
        });
        dispatch({ type: 'SET_USER', payload: { user: session.user } });
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
        dispatch({ type: 'REMOVE_USER' });
      }
    })();
  }, []);

  return (
    <Navbar
      expand="lg"
      className={`${styles.navbar} bg-light`}
      sticky="top"
      ref={navbarRef}
      collapseOnSelect
    >
      <Container>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav activeKey={router.pathname} defaultActiveKey="/">
            <Link href="/" passHref legacyBehavior>
              <Nav.Link className="d-none">בית</Nav.Link>
            </Link>
            <Link href="/#bundles-section" passHref legacyBehavior>
              <Nav.Link>{text.header.navbar.order}</Nav.Link>
            </Link>
            <Link href="/info" passHref legacyBehavior>
              <Nav.Link>{text.header.navbar.info}</Nav.Link>
            </Link>
            <Link href="/guide" passHref legacyBehavior>
              <Nav.Link>{text.header.navbar.guide}</Nav.Link>
            </Link>
            <Link href="/about" passHref legacyBehavior>
              <Nav.Link>{text.header.navbar.about}</Nav.Link>
            </Link>
            <Link href="/contact" passHref legacyBehavior>
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
                <NavDropdown.Item
                  onClick={() => {
                    Sentry.setUser(null);
                    signOut();
                  }}
                >
                  התנתק
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Link href="/login" passHref legacyBehavior>
                <Nav.Link>{text.header.navbar.login}</Nav.Link>
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
        <Link href="/" passHref>
          <Navbar.Brand
            className="d-flex justify-content-end"
            style={{ marginLeft: '0' }}
          >
            <Image
              src={logoImageBlackText}
              alt="Logo image"
              layout="fixed"
              width={53.4}
              height={32}
            />
          </Navbar.Brand>
        </Link>
      </Container>
    </Navbar>
  );
}

export default CustomNavbar;
