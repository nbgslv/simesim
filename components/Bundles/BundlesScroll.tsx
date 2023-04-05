import React, { useLayoutEffect } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { motion, useSpring } from 'framer-motion';
import styles from './Bundles.module.scss';
import RightArrow from '../../public/right-arrow.svg';
import BundleCard from './BundleCard';
import LeftArrow from '../../public/left-arrow.svg';

type BundlesScrollProps = {
  cards: {
    value: string;
    disabled: boolean;
    displayValue: string;
  }[];
  selected: string | null;
  onSelect: (value: string) => void;
};

const BundlesScroll = ({ cards, selected, onSelect }: BundlesScrollProps) => {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const spring = useSpring(0, { stiffness: 500, damping: 150, mass: 1 });

  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      spring.onChange((latest) => {
        scrollContainerRef.current!.scrollTo(latest, 0);
      });
    }
  }, [spring]);

  const handleBundleVolumeSelect = (value: string) => {
    onSelect(value);
  };

  return (
    <Row className="d-flex justify-content-center align-items-center">
      <Col className="d-flex justify-content-center align-items-center">
        {(scrollContainerRef.current?.scrollWidth ?? 0) >
          (scrollContainerRef.current?.clientWidth ?? 0) && (
          <div>
            <Button
              onClick={() => {
                spring.set(scrollContainerRef.current!.scrollLeft - 70);
              }}
              className={styles.arrowButton}
            >
              <RightArrow />
            </Button>
          </div>
        )}
        <motion.div
          layoutScroll
          ref={scrollContainerRef}
          className={styles.bundlesScroll}
        >
          <div className={styles.bundlesContainer}>
            {cards.length
              ? cards
                  .sort((a, b) => Number(a.value) - Number(b.value))
                  .filter((card) => !card.disabled)
                  .map((card) => (
                    <React.Fragment key={card.value}>
                      <BundleCard
                        text={card.displayValue}
                        value={card.value}
                        selected={card.value === selected}
                        onSelect={handleBundleVolumeSelect}
                        disabled={card.disabled}
                      />
                    </React.Fragment>
                  ))
              : null}
          </div>
        </motion.div>
        {(scrollContainerRef.current?.scrollWidth ?? 0) >
          (scrollContainerRef.current?.clientWidth ?? 0) && (
          <div>
            <Button
              className={styles.arrowButton}
              onClick={() => {
                spring.set(scrollContainerRef.current!.scrollLeft + 70);
              }}
            >
              <LeftArrow />
            </Button>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default BundlesScroll;
