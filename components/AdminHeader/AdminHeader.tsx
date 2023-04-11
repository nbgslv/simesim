import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import * as Sentry from '@sentry/nextjs';
import Image from 'next/legacy/image';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './AdminHeader.module.scss';

const AdminHeader = () => (
  <Navbar className={styles.main}>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav>
        <Link href="/admin/main" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/main">ראשי</Nav.Link>
        </Link>
        <Link href="/admin/plans" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/plans">תכניות</Nav.Link>
        </Link>
        <Link href="/admin/lines" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/lines">קווים</Nav.Link>
        </Link>
        <Link href="/admin/bundles" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/bundles">חבילות</Nav.Link>
        </Link>
        <Link href="/admin/plansModel" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/plansModel">מודלים</Nav.Link>
        </Link>
        <Link href="/admin/countries" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/countries">מדינות</Nav.Link>
        </Link>
        <Link href="/admin/coupons" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/coupons">קופונים</Nav.Link>
        </Link>
        <Link href="/admin/transactions" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/transactions">תנועות</Nav.Link>
        </Link>
        <Link href="/admin/users" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/users">משתמשים</Nav.Link>
        </Link>
        <Link href="/admin/supportedphones" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/supportedphones">טלפונים נתמכים</Nav.Link>
        </Link>
        <Link href="/admin/blog" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/blog">בלוג</Nav.Link>
        </Link>
        <Link href="/admin/inquiries" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/inquiries">פניות</Nav.Link>
        </Link>
        <Link href="/admin/apikeys" passHref legacyBehavior>
          <Nav.Link eventKey="/admin/apikeys">API</Nav.Link>
        </Link>
        <Link href="/admin/settings" passHref legacyBehavior>
          <Nav.Link eventKey="/settings">הגדרות</Nav.Link>
        </Link>
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
        <Link href="/" passHref legacyBehavior>
          <Nav.Link>חזרה לאתר</Nav.Link>
        </Link>
      </Nav>
    </Navbar.Collapse>
    <Navbar.Brand>
      <Image src="/logo.png" alt="logo" width={80} height={50} />
    </Navbar.Brand>
  </Navbar>
);

export default AdminHeader;
