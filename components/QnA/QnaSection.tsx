import React from 'react';
import Section from "../Section/Section";
import {Accordion} from "react-bootstrap";
import styles from './QnaSection.module.scss';
import Image from "next/image";
import {motion} from 'framer-motion';

const QnaSection = () => {
    return (
        <Section id={'qna-section'} title={'שאלות ותשובות'} className={styles.qnaSection}>
            <Accordion defaultActiveKey="0" className="shadow">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Accordion Item #1</Accordion.Header>
                    <Accordion.Body>
                        <strong>This is the first item's accordion body.</strong> It is shown by default, until the
                        collapse plugin adds the appropriate classes that we use to style each element. These classes
                        control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                        modify any of this with custom CSS or overriding our default variables. It's also worth noting
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Accordion Item #1</Accordion.Header>
                    <Accordion.Body>
                        <strong>This is the first item's accordion body.</strong> It is shown by default, until the
                        collapse plugin adds the appropriate classes that we use to style each element. These classes
                        control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                        modify any of this with custom CSS or overriding our default variables. It's also worth noting
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>Accordion Item #1</Accordion.Header>
                    <Accordion.Body>
                        <strong>This is the first item's accordion body.</strong> It is shown by default, until the
                        collapse plugin adds the appropriate classes that we use to style each element. These classes
                        control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                        modify any of this with custom CSS or overriding our default variables. It's also worth noting
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="3">
                    <Accordion.Header>Accordion Item #1</Accordion.Header>
                    <Accordion.Body>
                        <strong>This is the first item's accordion body.</strong> It is shown by default, until the
                        collapse plugin adds the appropriate classes that we use to style each element. These classes
                        control the overall appearance, as well as the showing and hiding via CSS transitions. You can
                        modify any of this with custom CSS or overriding our default variables. It's also worth noting
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
            <motion.div className={styles.qnaImage} animate={{ rotate: [0, 45, -45, 0] }} transition={{ repeat: Infinity, duration: 5, repeatType: 'mirror', type: 'spring' }}>
                <Image src={'/plane.svg'} alt={'faq'} layout="responsive" width={500} height={300} />
            </motion.div>
        </Section>
    );
};

export default QnaSection;
