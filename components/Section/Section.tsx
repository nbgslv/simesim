import React from 'react';
import styles from './Section.module.scss';
import { Container } from 'react-bootstrap';

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
}: SectionProps) => {
  return (
    <div className={className} ref={sectionRef} id="section">
      <Container as="section" className={styles.section} id={id}>
        {title && (
          <h1 className={`${styles.sectionTitle} text-center mb-4`}>{title}</h1>
        )}
        {children}
      </Container>
    </div>
  );
};

export default Section;
