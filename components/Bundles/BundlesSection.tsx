import { Country, PlanModel, Prisma } from '@prisma/client';
import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Lottie from 'react-lottie';
import { AnimatePresence, motion } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import { useRouter } from 'next/router';
import SectionComponent from '../Section/Section';
import CountrySearch, { ExtendedCountry } from '../CountrySearch/CountrySearch';
import styles from './BundlesSection.module.scss';
import * as travelImageData from '../../public/travel.json';
import OrderModal from '../Order/OrderModal';
import Bundles from './Bundles';
import { gtagEvent } from '../../lib/gtag';
import { fbpEvent } from '../../lib/fbpixel';

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
  const [filteredBundles, setFilteredBundles] = useState<
    (PlanModel &
      Prisma.PlanModelGetPayload<{
        include: { refill: { include: { bundle: true } } };
      }>)[]
  >([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const countrySearchRef = useRef<any>();
  const couponDivRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (router.query.coupon && couponDivRef.current) {
      couponDivRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [router.query.coupon]);

  const handleCountrySelect = (country: ExtendedCountry | null) => {
    fbpEvent('Search', {
      content_category: 'country_search',
      search_string: country?.name,
    });
    gtagEvent({
      action: 'search',
      parameters: {
        search_term: country?.name,
      },
    });
    setSelectedCountry(country);
    if (country) {
      setCurrentStep(1);
      if (country !== selectedCountry) {
        setSelectedBundle(null);
        setFilteredBundles(
          bundlesList
            .filter((planModel) =>
              planModel.refill.bundle.coverage.includes(country.name as string)
            )
            .sort((a, b) => b.price - a.price)
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

  const handleOrderModalClose = () => {
    setOrderModalOpen(false);
    if (!router.query.coupon) {
      setCurrentStep(1);
    }
  };

  const handleOrderButtonClick = () => {
    router.push(
      {
        pathname: '/',
        query: {
          ...router.query,
          country: selectedCountry?.name,
          bundle: selectedBundle,
        },
      },
      undefined,
      { shallow: true }
    );
    setOrderModalOpen(true);
  };

  return (
    <AnimatePresence>
      <SectionComponent id="bundles-section" className={styles.bundlesSection}>
        <Row
          className={`d-flex justify-content-between align-items-center p-3 ${styles.row}`}
        >
          <Col
            className={`d-flex justify-content-between flex-column ${styles.bundlesSearch}`}
          >
            {router.query.coupon && (
              <div
                ref={couponDivRef}
                className={`d-flex justify-content-center ${styles.couponRow}`}
              >
                הקופון {router.query.coupon} ימתין לכם בהמשך ההזמנה
              </div>
            )}
            {currentStep >= 0 ? (
              <motion.div className={styles.firstStepContainer} layout>
                <div className={`${styles.infoPlate} p-1 mb-2`}>
                  <h3 id="flight-destination">1. מספרים לנו לאן אתם טסים</h3>
                </div>
                <div className="h-100 p-2">
                  <CountrySearch
                    ref={countrySearchRef}
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
                  <Bundles
                    countriesList={countriesList}
                    bundlesList={filteredBundles}
                    onChange={handleBundleSelect}
                  />
                </div>
              </div>
            ) : null}
            {currentStep >= 1 && (
              <div className="d-flex justify-content-between">
                <Button
                  variant="primary"
                  size="lg"
                  className={`${styles.orderButton}`}
                  onClick={() => handleOrderButtonClick()}
                  disabled={!selectedBundle}
                >
                  3. מזמינים
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className={`${styles.cancelButton}`}
                  onClick={() => {
                    countrySearchRef.current?.handleCancel();
                    countrySearchRef.current?.autocompleteRef.current?.mainInputRef.current?.scrollIntoView(
                      {
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center',
                      }
                    );
                  }}
                >
                  בא לי מדינה אחרת
                </Button>
              </div>
            )}
            <OrderModal
              show={orderModalOpen}
              onHide={handleOrderModalClose}
              country={selectedCountry?.displayValue}
              bundle={bundlesList.find(
                (bundle) => bundle.id === selectedBundle
              )}
              countriesList={countriesList}
              defaultCoupon={router.query.coupon as string}
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
      </SectionComponent>
    </AnimatePresence>
  );
};

export default BundlesSection;
