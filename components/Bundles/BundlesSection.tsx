import { GridRowId } from '@mui/x-data-grid';
import { Country, Bundle, Refill, Prisma } from '@prisma/client';
import React, { useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Lottie from 'react-lottie';
import { AnimatePresence, motion } from 'framer-motion';
import Section from '../Section/Section';
import CountrySearch, { ExtendedCountry } from '../CountrySearch/CountrySearch';
import styles from './BundlesSection.module.scss';
import * as travelImageData from '../../public/travel.json';
import BundlesScroll from './BundlesScroll';
import OrderModal from '../Order/OrderModal';

type BundlesSectionProps = {
  countriesList: Country[];
  bundlesList: (Bundle &
    Prisma.BundleGetPayload<{ select: { refills: true } }>)[];
};

const BundlesSection = ({
  countriesList,
  bundlesList,
}: BundlesSectionProps) => {
  const [
    selectedCountry,
    setSelectedCountry,
  ] = useState<ExtendedCountry | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<GridRowId | null>(null);
  const [selectedRefill, setSelectedRefill] = useState<Refill | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);

  const handleCountrySelect = (country: ExtendedCountry | null) => {
    setSelectedCountry(country);
    if (country) {
      setCurrentStep(1);
      if (country !== selectedCountry) {
        setSelectedBundle(null);
        setSelectedRefill(null);
      }
    } else {
      setCurrentStep(0);
      setSelectedBundle(null);
      setSelectedRefill(null);
    }
  };

  const handleRefillSelect = (
    refill: Refill | null,
    bundleId: GridRowId | null
  ) => {
    setSelectedBundle(bundleId);
    setSelectedRefill(refill);
    if (refill && bundleId) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleRefillReset = () => {
    setSelectedBundle(null);
    setSelectedRefill(null);
    setCurrentStep(1);
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
                  <h3>1. מספרים לנו לאן אתם טסים</h3>
                </div>
                <div className="h-100 p-2">
                  <CountrySearch
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
                    bundlesList={bundlesList}
                    setRefill={handleRefillSelect}
                    resetRefill={handleRefillReset}
                  />
                </div>
              </div>
            ) : null}
            {currentStep >= 2 ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  className={`${styles.orderButton} w-100`}
                  onClick={() => setOrderModalOpen(true)}
                >
                  3. מזמינים
                </Button>
                <OrderModal
                  show={orderModalOpen}
                  onHide={() => setOrderModalOpen(false)}
                  country={selectedCountry?.displayValue}
                  bundle={bundlesList.find(
                    (bundle) => bundle.id === selectedBundle
                  )}
                  refill={selectedRefill}
                />
              </>
            ) : null}
          </Col>
          <Col>
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: travelImageData,
              }}
            />
          </Col>
        </Row>
      </Section>
    </AnimatePresence>
  );
};

export default BundlesSection;
