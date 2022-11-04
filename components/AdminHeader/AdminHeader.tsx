import React from 'react';
import {Nav, Navbar} from "react-bootstrap";
import Image from "next/image";
import styles from './AdminHeader.module.scss'

const AdminHeader = () => {
    return (
        <Navbar className={styles.main}>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav>
                    <Nav.Link href="/admin/main">ראשי</Nav.Link>
                    <Nav.Link href="/admin/main">תכניות</Nav.Link>
                    <Nav.Link href="/admin/main">משתמשים</Nav.Link>
                    <Nav.Link href="/admin/main">קווים</Nav.Link>
                    <Nav.Link href="/admin/main">הגדרות</Nav.Link>
                </Nav>
                <Nav className="me-auto">
                    <Nav.Link href="/admin/main">יציאה</Nav.Link>
                </Nav>
            </Navbar.Collapse>
            <Navbar.Brand>
                <Image src="/logo.png" alt="logo" width={80} height={50} />
            </Navbar.Brand>
        </Navbar>
    );
};

export default AdminHeader;
