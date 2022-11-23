import { GridRowId } from '@mui/x-data-grid';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bundle, Prisma, Refill } from '@prisma/client';
import BundleCard from './BundleCard';
import LeftArrow from '../../public/left-arrow.svg';
import RightArrow from '../../public/right-arrow.svg';
import styles from './BundlesScroll.module.scss';

const BundlesScroll = ({
  bundlesList,
  setRefill,
  resetRefill,
}: {
  bundlesList: (Bundle &
    Prisma.BundleGetPayload<{ select: { refills: true } }>)[];
  setRefill: (refill: Refill | null, bundleId: GridRowId | null) => void;
  resetRefill: () => void;
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
    resetRefill();
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

  return (
    <div className="w-100 position-relative" style={{ height: '82%' }}>
      <button
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
        >
          <motion.div
            className={styles.bundleCardWrapper}
            whileHover={{
              scale: 1.1,
              boxShadow: '0px 3px 15px 5px rgba(0,0,0,0.25)',
            }}
          >
            <BundleCard
              bundle={bundlesList[currentBundle]}
              setRefill={setRefill}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      <button
        type="button"
        className={styles.arrowButtonLeft}
        onClick={() => paginate(-1)}
      >
        <LeftArrow />
      </button>
    </div>
  );
};

export default BundlesScroll;
