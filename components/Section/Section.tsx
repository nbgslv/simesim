import React from 'react';
import styles from './Section.module.scss';
import { Container } from 'react-bootstrap';
import ScrollElement from "../ScrollController/ScrollElement";

type SectionProps = {
    children: JSX.Element[] | JSX.Element | null,
    title?: string,
    id: string
    className?: string
}

const Section = ({ children, title, id, className }: SectionProps) => {

    return (
        <ScrollElement className={className} id="section" name={id}>
            <Container
                as="section"
                className={styles.section}
                id={id}
            >
                {title && <h1 className={`${styles.sectionTitle} text-center mb-4`}>{title}</h1>}
                {children}
            </Container>
        </ScrollElement>
  )
};

export default Section;
