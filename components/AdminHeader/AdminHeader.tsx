import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import Image from 'next/image';
import styles from './AdminHeader.module.scss';
import { signOut } from 'next-auth/react';

const AdminHeader = () => {
  return (
    <Navbar className={styles.main}>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav>
          <Nav.Link eventKey="/" href="/admin/main">
            ראשי
          </Nav.Link>
          <Nav.Link eventKey="/plans" href="/admin/plans">
            תכניות
          </Nav.Link>
          <Nav.Link eventKey="/lines" href="/admin/lines">
            קווים
          </Nav.Link>
          <Nav.Link eventKey="/bundles" href="/admin/bundles">
            חבילות
          </Nav.Link>
          <Nav.Link eventKey="/plansModel" href="/admin/plansModel">
            מודלים
          </Nav.Link>
          <Nav.Link eventKey="/countries" href="/admin/countries">
            מדינות
          </Nav.Link>
          <Nav.Link eventKey="/plansModel" href="/admin/coupons">
            קופונים
          </Nav.Link>
          <Nav.Link eventKey="/users" href="/admin/users">
            משתמשים
          </Nav.Link>
          <Nav.Link eventKey="/settings" href="/admin/main">
            הגדרות
          </Nav.Link>
        </Nav>
        <Nav className="me-auto">
          <Nav.Link onClick={() => signOut()}>התנתק</Nav.Link>
          <Nav.Link href="/">חזרה לאתר</Nav.Link>
        </Nav>
      </Navbar.Collapse>
      <Navbar.Brand>
        <Image src="/logo.png" alt="logo" width={80} height={50} />
      </Navbar.Brand>
    </Navbar>
  );
};

export default AdminHeader;
