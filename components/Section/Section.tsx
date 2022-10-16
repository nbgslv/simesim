import React from 'react';
import styles from './Section.module.scss';
import { Container } from 'react-bootstrap';

type SectionProps = {
    children: JSX.Element[] | JSX.Element | null,
    title?: string,
    id: string
}

const Section = ({ children, title, id }: SectionProps) => {
  return (
      <Container
          as="section"
          className={styles.section}
          id={id}
      >
          {title && <h1 className={`${styles.sectionTitle} text-center mb-4`}>{title}</h1>}
          {children}
      </Container>
  )
};

export default Section;
