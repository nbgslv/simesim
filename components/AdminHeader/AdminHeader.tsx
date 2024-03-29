import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import * as Sentry from '@sentry/nextjs';
import Image from 'next/legacy/image';
import { signOut } from 'next-auth/react';
import styles from './AdminHeader.module.scss';

const AdminHeader = () => (
  <Navbar className={styles.main}>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav>
        <Nav.Link eventKey="/admin/main" href="/admin/main">
          ראשי
        </Nav.Link>
        <Nav.Link eventKey="/admin/plans" href="/admin/plans">
          תכניות
        </Nav.Link>
        <Nav.Link eventKey="/admin/lines" href="/admin/lines">
          קווים
        </Nav.Link>
        <Nav.Link eventKey="/admin/bundles" href="/admin/bundles">
          חבילות
        </Nav.Link>
        <Nav.Link eventKey="/admin/plansModel" href="/admin/plansModel">
          מודלים
        </Nav.Link>
        <Nav.Link eventKey="/admin/countries" href="/admin/countries">
          מדינות
        </Nav.Link>
        <Nav.Link eventKey="/admin/coupons" href="/admin/coupons">
          קופונים
        </Nav.Link>
        <Nav.Link eventKey="/admin/users" href="/admin/transactions">
          תנועות
        </Nav.Link>
        <Nav.Link eventKey="/admin/users" href="/admin/users">
          משתמשים
        </Nav.Link>
        <Nav.Link
          eventKey="/admin/supportedphones"
          href="/admin/supportedphones"
        >
          טלפונים נתמכים
        </Nav.Link>
        <Nav.Link eventKey="/admin/blog" href="/admin/blog">
          בלוג
        </Nav.Link>
        <Nav.Link eventKey="/admin/inquiries" href="/admin/inquiries">
          פניות
        </Nav.Link>
        <Nav.Link eventKey="/admin/apikeys" href="/admin/apikeys">
          API
        </Nav.Link>
        <Nav.Link eventKey="/settings" href="/admin/settings">
          הגדרות
        </Nav.Link>
      </Nav>
      <Nav className="me-auto">
        <Nav.Link
          onClick={() => {
            Sentry.setUser(null);
            signOut();
          }}
        >
          התנתק
        </Nav.Link>
        <Nav.Link href="/">חזרה לאתר</Nav.Link>
      </Nav>
    </Navbar.Collapse>
    <Navbar.Brand>
      <Image src="/logo.png" alt="logo" width={80} height={50} />
    </Navbar.Brand>
  </Navbar>
);

export default AdminHeader;
