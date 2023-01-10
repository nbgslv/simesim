import React from 'react';
import { Accordion } from 'react-bootstrap';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './QnaSection.module.scss';
import SectionComponent from '../Section/Section';
import text from '../../lib/content/text.json';

const QnaSection = () => (
  <SectionComponent
    id={'qna-section'}
    title={'שאלות ותשובות'}
    className={styles.qnaSection}
  >
    <Accordion defaultActiveKey="0" className="shadow">
      {text.qna.map((qna, index) => (
        <Accordion.Item eventKey={index.toString()} key={index}>
          <Accordion.Header>{qna.question}</Accordion.Header>
          <Accordion.Body>
            <p className={styles.qnaColor}>{qna.answer}</p>
            {qna.a_text && qna.a_href ? (
              <p className={styles.qnaColor}>
                <a href={qna.a_href}>{qna.a_text}</a>
              </p>
            ) : null}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
    <motion.div
      className={styles.qnaImage}
      animate={{ rotate: [0, 45, -45, 0] }}
      transition={{
        repeat: Infinity,
        duration: 5,
        repeatType: 'mirror',
        discountType: 'spring',
      }}
    >
      <Image
        src={'/plane.svg'}
        alt={'faq'}
        layout="responsive"
        width={500}
        height={300}
        priority
      />
    </motion.div>
  </SectionComponent>
);

export default QnaSection;
