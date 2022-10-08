import React, {LegacyRef, RefObject} from 'react';
import styles from './Section.module.scss';
import { Container } from 'react-bootstrap';

const Section = ({ children, title, sticky, forwardRef }: { children: JSX.Element[] | JSX.Element | null, title: string, sticky: boolean, forwardRef: RefObject<HTMLElement> | null | undefined }) => {
  return (
    <Container as="section" className={styles.section} style={{ position: sticky ? 'sticky' : undefined }} ref={forwardRef}>
      <h1 className={`${styles.sectionTitle} text-center mb-4`}>{title}</h1>
      {children}
    </Container>
  );
};

export default Section;
