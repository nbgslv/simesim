import React, { ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import styles from './TimelineItem.module.scss';

type TimelineItemProps = {
  children: ReactNode;
  tooltipText?: string;
  disableAnimation: (key: number) => void;
  animationKey: number;
  animate: boolean;
  onHovered?: () => void;
};

const TimelineItem = ({
  children,
  tooltipText,
  disableAnimation,
  animationKey,
  animate,
  onHovered,
}: TimelineItemProps) => {
  const [active, setActive] = useState<boolean>(false);
  const [animationActive, setAnimationActive] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const controls = useAnimation();

  useEffect(() => {
    (async () => {
      if (animate) {
        await controls.start('start');
        setAnimationActive(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!animationActive) setShowTooltip(true);
    else setShowTooltip(false);
  }, [animationActive]);

  useEffect(() => {
    if (!animate) setAnimationActive(false);
  }, [animate]);

  const handleMouseEnter = () => {
    setActive(true);
    setShowTooltip(false);
    controls.stop();
    disableAnimation(animationKey);
    if (onHovered) {
      onHovered();
    }
  };

  const handleMouseLeave = async () => {
    setActive(false);
    if (animate) {
      await controls.start('start');
      setAnimationActive(true);
    }
  };

  const getRandomDelay = () => -(Math.random() * 0.7 + 0.05);

  const randomDuration = () => Math.random() * 0.07 + 0.23;

  const variants = {
    start: {
      x: [-10, 13, 0],
      transition: {
        delay: getRandomDelay(),
        repeat: 5,
        duration: randomDuration(),
      },
    },
  };

  const handleAnimationComplete = () => {
    setAnimationActive(false);
    setTimeout(async () => {
      if (animate) await controls.start('start');
      setAnimationActive(true);
    }, Math.abs(getRandomDelay()) * 10000);
  };

  return (
    <div
      className={`${styles.timelineItem} ${active ? styles.active : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence initial={false} mode="wait">
        {isMobile ? (
          <motion.div
            key={2}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={styles.timelineContent}
          >
            {children}
            <p>{tooltipText}</p>
          </motion.div>
        ) : (
          <>
            {!active ? (
              <motion.div
                key={1}
                initial={{ opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className={styles.timelineItemText}
              >
                <motion.div
                  variants={variants}
                  animate={controls}
                  onAnimationComplete={handleAnimationComplete}
                >
                  {children}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key={2}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className={styles.timelineContent}
              >
                <p>{tooltipText}</p>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {showTooltip && animate && (
          <motion.div
            key={3}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={styles.tooltip}
          >
            עברו עליי עם העכבר
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelineItem;
