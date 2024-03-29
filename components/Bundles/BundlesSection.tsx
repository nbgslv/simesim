import { Country, PlanModel, Prisma } from '@prisma/client';
import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import Lottie from 'react-lottie';
import { AnimatePresence, motion } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import { useRouter } from 'next/router';
import lookup from 'country-code-lookup';
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
  editMode?: boolean;
  countryId?: string;
  currentBundleId?: string;
  editPlanId?: string;
};

const BundlesSection = ({
  countriesList,
  bundlesList,
  editMode = false,
  countryId,
  currentBundleId,
  editPlanId,
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
  const [editApiRequestLoading, setEditApiRequestLoading] = useState<boolean>(
    false
  );
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

  useEffect(() => {
    if (
      editMode &&
      countryId &&
      currentBundleId &&
      countrySearchRef.current &&
      countrySearchRef.current.autocompleteRef.current
    ) {
      const country = countriesList.find((c) => c.id === countryId);
      if (country) {
        const extendedCountry = {
          name: country.name,
          id: country.id,
          translation: country.translation,
          iso2: lookup.byCountry(country.name)?.iso2,
          displayValue: `${country.translation} (${country.name})`,
        };
        handleCountrySelect(extendedCountry);
        countrySearchRef.current.autocompleteRef.current.handleSelect(
          extendedCountry
        );
        handleBundleSelect(currentBundleId);
      }
    }
  }, [editMode, countryId, currentBundleId]);

  const handleOrderModalClose = () => {
    setOrderModalOpen(false);
    if (!router.query.coupon) {
      setCurrentStep(1);
    }
  };

  const handleOrderButtonClick = async () => {
    try {
      if (editMode) {
        setEditApiRequestLoading(true);
        const updateResult = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/edit/${editPlanId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bundleId: selectedBundle,
              countryId: selectedCountry?.id,
            }),
          }
        );
        const updateResultJson = await updateResult.json();
        if (updateResultJson.success) {
          router.push(`/order/finish/${editPlanId}`);
        } else {
          router.push(`/error?error=Order`);
        }
      } else {
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
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEditApiRequestLoading(false);
    }
  };

  const getButtonLabel = () => (editMode ? 'שמור שינויים' : 'מזמינים');

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
                  <h3 id="flight-destination">מספרים לנו לאן אתם טסים</h3>
                </div>
                <div className={`h-100 p-2`}>
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
              <div className="h-100 mt-md-4">
                <div className={`${styles.infoPlate} p-1 mb-2`}>
                  <h3>בוחרים חבילת דאטה</h3>
                </div>
                <div className="h-100">
                  <div>
                    <Bundles
                      countriesList={countriesList}
                      bundlesList={filteredBundles}
                      onChange={handleBundleSelect}
                      editMode={editMode}
                      currentPlanModelId={currentBundleId}
                    />
                  </div>
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
                  disabled={!selectedBundle || editApiRequestLoading}
                >
                  {editApiRequestLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    getButtonLabel()
                  )}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className={`${styles.cancelButton}`}
                  disabled={editApiRequestLoading}
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
              bundle={bundlesList?.find(
                (bundle) => bundle.id === selectedBundle
              )}
              countriesList={countriesList}
              defaultCoupon={router.query.coupon as string}
            />
          </Col>
          {!isMobile && !editMode && !selectedCountry && (
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
