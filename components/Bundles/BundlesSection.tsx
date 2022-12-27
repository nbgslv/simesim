import { Country, PlanModel, Prisma } from '@prisma/client';
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import Lottie from 'react-lottie';
import { AnimatePresence, motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import Section from '../Section/Section';
import CountrySearch, { ExtendedCountry } from '../CountrySearch/CountrySearch';
import styles from './BundlesSection.module.scss';
import * as travelImageData from '../../public/travel.json';
import BundlesScroll from './BundlesScroll';
import OrderModal from '../Order/OrderModal';

type BundlesSectionProps = {
  countriesList: Country[];
  bundlesList: (PlanModel &
    Prisma.PlanModelGetPayload<{
      include: { refill: { include: { bundle: true } } };
    }>)[];
};

const BundlesSection = ({
  countriesList,
  bundlesList,
}: BundlesSectionProps) => {
  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState<ExtendedCountry | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [filteredBundles, setFilteredBundles] = useState<PlanModel[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  useEffect(() => {
    if (currentStep === 2) {
      setOrderModalOpen(true);
    } else {
      setOrderModalOpen(false);
    }
  }, [currentStep]);

  const handleCountrySelect = (country: ExtendedCountry | null) => {
    setSelectedCountry(country);
    if (country) {
      setCurrentStep(1);
      if (country !== selectedCountry) {
        setSelectedBundle(null);
        setFilteredBundles(
          bundlesList.filter((planModel) =>
            planModel.refill.bundle.coverage.includes(country.name as string)
          )
        );
      }
    } else {
      setCurrentStep(0);
      setSelectedBundle(null);
      setFilteredBundles([]);
    }
  };

  const handleBundleSelect = (bundleId: string | null) => {
    setSelectedBundle(bundleId);
    if (bundleId) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleBundleReset = () => {
    setSelectedBundle(null);
    setCurrentStep(1);
  };

  const handleOrderModalClose = () => {
    setOrderModalOpen(false);
    setCurrentStep(1);
    setSelectedBundle(null);
  };

  return (
    <AnimatePresence>
      <Section id="bundles-section" className={styles.bundlesSection}>
        <Row
          className={`d-flex justify-content-between align-items-center p-3 ${styles.row}`}
        >
          <Col
            className={`d-flex justify-content-between flex-column ${styles.bundlesSearch}`}
          >
            {currentStep >= 0 ? (
              <motion.div className={styles.firstStepContainer} layout>
                <div className={`${styles.infoPlate} p-1 mb-2`}>
                  <h3 id="flight-destination">1. מספרים לנו לאן אתם טסים</h3>
                </div>
                <div className="h-100 p-2">
                  <CountrySearch
                    ariaLabeledby="flight-destination"
                    countriesList={countriesList}
                    onSelect={handleCountrySelect}
                  />
                </div>
              </motion.div>
            ) : null}
            {currentStep >= 1 ? (
              <div className="h-100 mt-4">
                <div className={`${styles.infoPlate} p-1 mb-2`}>
                  <h3>2. בוחרים חבילת דאטה</h3>
                </div>
                <div className="h-100">
                  <BundlesScroll
                    bundlesList={filteredBundles}
                    setBundle={handleBundleSelect}
                    resetBundle={handleBundleReset}
                  />
                </div>
              </div>
            ) : null}
            {/* {currentStep >= 2 ? ( */}
            {/*  <> */}
            {/*    <Button */}
            {/*      variant="primary" */}
            {/*      size="lg" */}
            {/*      className={`${styles.orderButton} w-100`} */}
            {/*      onClick={() => setOrderModalOpen(true)} */}
            {/*    > */}
            {/*      3. מזמינים */}
            {/*    </Button> */}
            {/*  </> */}
            {/* ) : null} */}
            <OrderModal
              show={orderModalOpen}
              onHide={handleOrderModalClose}
              country={selectedCountry?.displayValue}
              bundle={bundlesList.find(
                (bundle) => bundle.id === selectedBundle
              )}
            />
          </Col>
          {!isMobile && !selectedCountry && (
            <Col role="presentation">
              <Lottie
                ariaLabel="Traveling animation"
                options={{
                  loop: true,
                  autoplay: true,
                  animationData: travelImageData,
                }}
              />
            </Col>
          )}
        </Row>
      </Section>
    </AnimatePresence>
  );
};

export default BundlesSection;
