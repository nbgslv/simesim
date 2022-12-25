import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlanModel } from '@prisma/client';
import BundleCard from './BundleCard';
import LeftArrow from '../../public/left-arrow.svg';
import RightArrow from '../../public/right-arrow.svg';
import styles from './BundlesScroll.module.scss';

const BundlesScroll = ({
  bundlesList,
  setBundle,
  resetBundle,
}: {
  bundlesList: PlanModel[];
  setBundle: (id: string | null) => void;
  resetBundle: () => void;
}) => {
  const [currentBundle, setCurrentBundle] = React.useState<number>(0);
  const [direction, setDirection] = React.useState<number>(0);
  const variants = {
    enter: (slideDirection: number) => ({
      x: slideDirection > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (slideDirection: number) => ({
      zIndex: 0,
      x: slideDirection < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    resetBundle();
    if (
      currentBundle + newDirection < bundlesList.length &&
      currentBundle + newDirection >= 0
    ) {
      setCurrentBundle(currentBundle + newDirection);
      setDirection(newDirection);
    } else if (currentBundle + newDirection === bundlesList.length) {
      setCurrentBundle(0);
      setDirection(0);
    } else if (currentBundle + newDirection === -1) {
      setCurrentBundle(bundlesList.length - 1);
      setDirection(0);
    }
  };

  if (bundlesList.length === 0)
    return (
      <div
        className="w-100 position-relative text-center"
        style={{ height: '82%' }}
      >
        לא מצאנו חבילות ליעד שבחרת =/
        <br />
        אנו עומלים כל הזמן כדי למצוא חבילות ליעדים חדשים במחירים אטרקטיביים
        <br />
        לכן מומלץ לבדוק פה שוב בקרוב
      </div>
    );

  return (
    <div className="w-100 position-relative" style={{ height: '82%' }}>
      {bundlesList.length > 1 ? (
        <>
          <button
            disabled={bundlesList.length === 1}
            type="button"
            className={styles.arrowButtonRight}
            onClick={() => paginate(1)}
          >
            <RightArrow />
          </button>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentBundle}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset }) => {
                if (offset.x < 0) {
                  paginate(1);
                } else if (offset.x > 0) {
                  paginate(-1);
                }
              }}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                height: '100%',
              }}
            >
              <BundleCard
                bundle={bundlesList[currentBundle]}
                setBundle={setBundle}
              />
            </motion.div>
          </AnimatePresence>
          <button
            type="button"
            className={styles.arrowButtonLeft}
            onClick={() => paginate(-1)}
          >
            <LeftArrow />
          </button>
        </>
      ) : (
        <BundleCard bundle={bundlesList[currentBundle]} setBundle={setBundle} />
      )}
    </div>
  );
};

export default BundlesScroll;
