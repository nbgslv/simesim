import React from 'react';
import { Container } from 'react-bootstrap';
import styles from './Section.module.scss';

type SectionProps = {
  children: JSX.Element[] | JSX.Element | null;
  title?: string;
  id: string;
  className?: string;
  sectionRef?: React.RefObject<HTMLDivElement>;
};

const Section = ({
  children,
  title,
  id,
  className,
  sectionRef,
}: SectionProps) => (
  <section className={className} ref={sectionRef} id={id || title}>
    <Container className={styles.section}>
      {title && (
        <h1 className={`${styles.sectionTitle} text-center mb-4`}>{title}</h1>
      )}
      {children}
    </Container>
  </section>
);

export default Section;
