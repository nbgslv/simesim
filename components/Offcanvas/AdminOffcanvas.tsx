import React from 'react';
import { Offcanvas } from 'react-bootstrap';
import styles from './AdminOffcanvas.module.scss';

type AdminOffcanvasProps = {
  show: boolean;
  title: string;
  children: React.ReactNode;
  onHide: () => void;
};

const AdminOffcanvas = ({
  show,
  title,
  children,
  onHide,
}: AdminOffcanvasProps) => (
  <Offcanvas
    className={styles.main}
    show={show}
    onHide={onHide}
    placement="end"
    scroll
    backdrop
  >
    <Offcanvas.Header
      className={styles.header}
      closeButton
      closeVariant="white"
    >
      <Offcanvas.Title className={styles.title}>{title}</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>{children}</Offcanvas.Body>
  </Offcanvas>
);

export default AdminOffcanvas;
