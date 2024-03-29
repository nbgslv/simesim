import React, { MouseEventHandler } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Section.module.scss';

type SectionProps = {
  open: boolean;
  title: string;
  onClickHandler: MouseEventHandler<HTMLButtonElement>;
  showWhenClosed?: React.ReactNode;
  children: React.ReactNode;
  clickable?: boolean;
};

const Section = ({
  open,
  title,
  onClickHandler,
  showWhenClosed,
  children,
  clickable = true,
}: SectionProps) => (
  <div className={styles.section}>
    <motion.button
      initial={false}
      onClick={onClickHandler}
      className={styles.sectionTitle}
      disabled={!clickable}
    >
      {title}
    </motion.button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: 'auto' },
            collapsed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="w-100"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
    <AnimatePresence initial={false}>
      {!open && showWhenClosed && (
        <motion.div
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { opacity: 1, height: 'auto' },
            collapsed: { opacity: 0, height: 0 },
          }}
          transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="w-100"
        >
          {showWhenClosed}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default Section;
