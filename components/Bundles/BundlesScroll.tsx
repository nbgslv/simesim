import React from 'react';
import { PlanModel } from '@prisma/client';
import { Carousel } from 'react-bootstrap';
import BundleCard from './BundleCard';
import styles from './BundlesScroll.module.scss';

const BundlesScroll = ({
  bundlesList,
  setBundle,
}: {
  bundlesList: PlanModel[];
  setBundle: (id: string | null) => void;
}) => {
  const [activeSlide, setActiveSlide] = React.useState(bundlesList.length - 1);
  const handleBundleSelect = (id: string | null) => {
    setBundle(id);
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

  const handleSlide = (index: number) => {
    setActiveSlide(index);
  };

  return (
    <Carousel
      interval={null}
      activeIndex={activeSlide}
      onSelect={handleSlide}
      className={styles.mainCarousel}
    >
      {bundlesList.map((bundle) => (
        <Carousel.Item key={bundle.id}>
          <BundleCard
            bundle={bundle}
            setBundle={(id) => {
              handleBundleSelect(id);
            }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default BundlesScroll;
