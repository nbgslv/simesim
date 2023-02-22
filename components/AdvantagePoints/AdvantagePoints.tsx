import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { motion, useAnimationControls } from 'framer-motion';
import { Col, Container, Row } from 'react-bootstrap';
import styles from './AdvantagePoints.module.scss';

const MotionRow = motion(Row);

const AdvantagePoints = () => {
  const [message, setMessage] = React.useState<string>('');
  const controls = useAnimationControls();

  useEffect(() => {
    if (message) {
      controls.start({
        opacity: 1,
        transition: {
          duration: 0.5,
        },
      });
    } else {
      controls.start({
        opacity: 0,
        transition: {
          duration: 0.5,
        },
      });
    }
  }, [message]);

  return (
    <Container className={styles.main}>
      <Row layout="position" className="mb-2">
        <Col
          onMouseEnter={() =>
            setMessage('רכשתם חבילה והטלפון לא תומך? קבלו החזר כספי בלי שאלות')
          }
          onMouseLeave={() => setMessage('')}
          className={styles.column}
        >
          <div className={styles.icon}>
            <FontAwesomeIcon icon={solid('money-bill-transfer')} />
          </div>
          <div className={styles.title}>החזר כספי מובטח</div>
        </Col>
        <Col
          onMouseEnter={() =>
            setMessage(
              'כל הפרטים באתר מוצפנים ומועברים בצורה מאובטחת בטכנולוגיית SSL. כל עסקאות האשראי מאובטחות בתקן PCI המתקדם'
            )
          }
          onMouseLeave={() => setMessage('')}
          className={styles.column}
        >
          <div className={styles.icon}>
            <FontAwesomeIcon icon={solid('shield')} />
          </div>
          <div className={styles.title}>אבטחת המידע שלכם</div>
        </Col>
        <Col
          onMouseEnter={() =>
            setMessage(
              'מגוון חבילות חו"ל רחב במחירים הנמוכים ביותר; יותר מ-100 מדינות נתמכות; מעבר בין מדינות בלי להחליף eSim!'
            )
          }
          onMouseLeave={() => setMessage('')}
          className={styles.column}
        >
          <div className={styles.icon}>
            <FontAwesomeIcon icon={solid('shekel-sign')} />
          </div>
          <div className={styles.title}>מגוון חבילות חו&quot;ל רחב</div>
        </Col>
        <Col
          onMouseEnter={() =>
            setMessage("גישה לחבילות ותמיכה בוואצאפ, בצ'אט ובטלפון מסביב לשעון")
          }
          onMouseLeave={() => setMessage('')}
          className={styles.column}
        >
          <div className={styles.icon}>
            <FontAwesomeIcon icon={solid('clock')} />
          </div>
          <div className={styles.title}>שירות ותמיכה מסביב לשעון</div>
        </Col>
      </Row>
      <MotionRow animate={controls} className={styles.empty}>
        <Col>{message}</Col>
      </MotionRow>
    </Container>
  );
};

export default AdvantagePoints;
