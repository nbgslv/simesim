import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { motion } from 'framer-motion';
import styles from './AdvantagePoints.module.scss';

const AdvantagePoints = () => {
  const [hover, setHover] = React.useState<number>(-1);
  return (
    <div className={styles.main}>
      <div
        onMouseEnter={() => setHover(0)}
        onMouseLeave={() => setHover(-1)}
        className={styles.column}
      >
        <div className={styles.icon}>
          <FontAwesomeIcon icon={solid('money-bill-transfer')} />
        </div>
        <div className={styles.title}>החזר כספי מובטח</div>
        {hover === 0 ? (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            רכשתם חבילה והטלפון לא תומך? קבלו החזר כספי בלי שאלות
          </motion.div>
        ) : (
          <div className={styles.empty} />
        )}
      </div>
      <div
        onMouseEnter={() => setHover(1)}
        onMouseLeave={() => setHover(-1)}
        className={styles.column}
      >
        <div className={styles.icon}>
          <FontAwesomeIcon icon={solid('shield')} />
        </div>
        <div className={styles.title}>אבטחת המידע שלכם</div>
        {hover === 1 ? (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            כל הפרטים באתר מוצפנים ומועברים בצורה מאובטחת בטכנולוגיית SSL. כל
            עסקאות האשראי מאובטחות בתקן PCI המתקדם
          </motion.div>
        ) : (
          <div className={styles.empty} />
        )}
      </div>
      <div
        onMouseEnter={() => setHover(2)}
        onMouseLeave={() => setHover(-1)}
        className={styles.column}
      >
        <div className={styles.icon}>
          <FontAwesomeIcon icon={solid('shekel-sign')} />
        </div>
        <div className={styles.title}>מגוון חבילות חו&quot;ל רחב</div>
        {hover === 2 ? (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            מגוון חבילות חו&quot;ל רחב במחירים הנמוכים ביותר; יותר מ-100 מדינות
            נתמכות; מעבר בין מדינות בלי להחליף eSim!
          </motion.div>
        ) : (
          <div className={styles.empty} />
        )}
      </div>
      <div
        onMouseEnter={() => setHover(3)}
        onMouseLeave={() => setHover(-1)}
        className={styles.column}
      >
        <div className={styles.icon}>
          <FontAwesomeIcon icon={solid('clock')} />
        </div>
        <div className={styles.title}>שירות ותמיכה מסביב לשעון</div>
        {hover === 3 ? (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            גישה לחבילות ותמיכה בוואצאפ, בצ&apos;אט ובטלפון מסביב לשעון
          </motion.div>
        ) : (
          <div className={styles.empty} />
        )}
      </div>
    </div>
  );
};

export default AdvantagePoints;
