import React, { useEffect } from 'react';
import { Country, PlanModel, Prisma } from '@prisma/client';
import { Col, Row } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import BundleCard from './BundleCard';
import styles from './Bundles.module.scss';
// eslint-disable-next-line import/no-cycle
import RoamingCountries from './RoamingCountries';
import { gtagEvent } from '../../lib/gtag';

export type BundlesList = PlanModel &
  Prisma.PlanModelGetPayload<{
    include: { refill: { include: { bundle: true } } };
  }>;

const Bundles = ({
  bundlesList,
  onChange,
  countriesList,
}: {
  bundlesList: BundlesList[];
  onChange: (bundleId: string | null) => void;
  countriesList: Country[];
}) => {
  const [selectedBundle, setSelectedBundle] = React.useState<string | null>(
    null
  );
  const [selectedBundleVolume, setSelectedBundleVolume] = React.useState<
    string | null
  >(null);
  const [selectedBundleDays, setSelectedBundleDays] = React.useState<
    string | null
  >(null);
  const [cheapestBundles, setCheapestBundles] = React.useState<
    {
      amount_mb: number;
      amount_days: number | null;
      id: string;
    }[]
  >([]);
  const [volumeOptions, setVolumeOptions] = React.useState<
    { option: number; disabled: boolean }[]
  >([]);
  const [daysOptions, setDaysOptions] = React.useState<
    { option: number; disabled: boolean }[]
  >([]);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  useEffect(() => {
    if (bundlesList.length) {
      const categories: {
        amount_mb: number;
        amount_days: number | null;
      }[] = [];
      bundlesList.forEach((bundle) => {
        if (
          categories.filter(
            (category) =>
              category.amount_days === bundle.refill.amount_days &&
              category.amount_mb === bundle.refill.amount_mb
          ).length === 0
        ) {
          categories.push({
            amount_days: bundle.refill.amount_days,
            amount_mb: bundle.refill.amount_mb,
          });
        }
      });
      const cheapestOptions: {
        amount_mb: number;
        amount_days: number | null;
        id: string;
      }[] = [];
      categories.forEach((category) => {
        const cheapestBundle = bundlesList
          .filter(
            (bundle) =>
              bundle.refill.amount_days === category.amount_days &&
              bundle.refill.amount_mb === category.amount_mb
          )
          .sort((a, b) => a.price - b.price)[0];
        cheapestOptions.push({
          amount_days: cheapestBundle.refill.amount_days,
          amount_mb: cheapestBundle.refill.amount_mb,
          id: cheapestBundle.id,
        });
      });
      setCheapestBundles(cheapestOptions);
      const volumeOptionsSet = new Set<number>();
      const daysOptionsSet = new Set<number>();
      cheapestOptions.forEach((option) => {
        volumeOptionsSet.add(option.amount_mb);
        daysOptionsSet.add(option.amount_days || 365);
      });
      setVolumeOptions(
        Array.from(volumeOptionsSet).map((option) => ({
          option,
          disabled: false,
        }))
      );
      setDaysOptions(
        Array.from(daysOptionsSet).map((option) => ({
          option,
          disabled: false,
        }))
      );
    }
  }, [bundlesList]);

  useEffect(() => {
    const selectedBundleCandidate = cheapestBundles.find(
      (bundle) =>
        ((bundle.amount_days !== 365 &&
          bundle.amount_days?.toString() === selectedBundleDays) ||
          (bundle.amount_days === null && selectedBundleDays === '365')) &&
        bundle.amount_mb.toString() === selectedBundleVolume
    );
    if (selectedBundleCandidate) {
      setSelectedBundle(selectedBundleCandidate.id);
      onChange(selectedBundleCandidate.id);
    } else {
      setSelectedBundle(null);
      onChange(null);
    }
  }, [selectedBundleDays, selectedBundleVolume]);

  useEffect(() => {
    if (selectedBundleVolume) {
      const availableDays = bundlesList.map((bundleOfBundlesList) =>
        bundleOfBundlesList.refill.amount_mb ===
        parseInt(selectedBundleVolume || '0', 10)
          ? bundleOfBundlesList.refill.amount_days
          : 0
      );
      if (availableDays.length) {
        const optionalDays = daysOptions.map((option) => ({
          option: option.option,
          disabled:
            option.option === 365
              ? !availableDays.includes(null)
              : !availableDays.includes(option.option),
        }));
        setDaysOptions(optionalDays);
        if (
          selectedBundleDays &&
          !availableDays.includes(parseInt(selectedBundleDays, 10))
        ) {
          setSelectedBundleDays(null);
        }

        if (
          optionalDays.length &&
          optionalDays.filter((option) => !option.disabled).length === 1
        ) {
          setSelectedBundleDays(
            optionalDays
              .filter((option) => !option.disabled)[0]
              .option.toString()
          );
        }
      }
    }
  }, [selectedBundleVolume]);

  const handleBundleVolumeSelect = (value: string) => {
    gtagEvent({
      action: 'select_content',
      parameters: {
        content_type: 'bundle_volume',
        content_id: value,
      },
    });
    setSelectedBundleVolume(value);
  };

  const handleBundleDaysSelect = (value: string) => {
    gtagEvent({
      action: 'select_content',
      parameters: {
        content_type: 'bundle_days',
        content_id: value,
      },
    });
    setSelectedBundleDays(value);
  };

  return (
    <div>
      <Row className="d-flex justify-content-center align-items-center">
        {volumeOptions.length
          ? volumeOptions
              .sort((a, b) => a.option - b.option)
              .map((volumeOption) => (
                <Col
                  className="d-flex justify-content-center align-items-center mb-4"
                  key={volumeOption.option}
                >
                  <BundleCard
                    text={`${Math.floor(volumeOption.option / 1024)} ג"ב`}
                    value={volumeOption.option.toString()}
                    selected={
                      volumeOption.option.toString() === selectedBundleVolume
                    }
                    onSelect={handleBundleVolumeSelect}
                    disabled={volumeOption.disabled}
                  />
                </Col>
              ))
          : null}
      </Row>
      <div className="mt-4 mb-4">
        <div className="text-center mb-2">לכמה זמן?</div>
        <Row className="d-flex justify-content-center align-items-center">
          {daysOptions.length
            ? daysOptions
                .sort((a, b) => a.option - b.option)
                .map((daysOption) => (
                  <Col
                    className="d-flex justify-content-center align-items-center"
                    key={daysOption.option}
                  >
                    <BundleCard
                      text={`${daysOption.option?.toString() || '365'} ימים`}
                      value={daysOption.option?.toString() || '365'}
                      selected={
                        (daysOption.option?.toString() || '365') ===
                        selectedBundleDays
                      }
                      onSelect={handleBundleDaysSelect}
                      disabled={daysOption.disabled}
                    />
                  </Col>
                ))
            : null}
        </Row>
      </div>
      {selectedBundle ? (
        <div>
          <div className={styles.price}>
            {'\u20AA'}
            {bundlesList.find((bundle) => bundle.id === selectedBundle)?.price}
          </div>
          {bundlesList.find((bundle) => bundle.id === selectedBundle)?.refill
            .bundle.coverage.length && isMobile ? (
            <div className="mb-4">
              <RoamingCountries
                countriesList={countriesList}
                selectedBundle={bundlesList.find(
                  (bundle) => bundle.id === selectedBundle
                )}
              />
            </div>
          ) : (
            bundlesList.find((bundle) => bundle.id === selectedBundle)?.refill
              .bundle.coverage.length && (
              <Row className="d-flex flex-column justify-content-center align-items-center mb-4">
                <Col>
                  <Row>
                    <Col className={styles.roamingCountriesHeader}>
                      טסים למדינות נוספות? הכרטיס יהיה תקף גם במעבר למדינות
                      הבאות:
                    </Col>
                  </Row>
                  <Row className={`text-center ${styles.whiteSpaceNowrap}`}>
                    {bundlesList
                      .find((bundle) => bundle.id === selectedBundle)
                      ?.refill.bundle.coverage.map((country: string, i) => (
                        <>
                          <Col key={country}>
                            {
                              countriesList.find(
                                (countryOfCountriesList) =>
                                  countryOfCountriesList.name === country
                              )?.translation
                            }
                          </Col>
                          {i !==
                            bundlesList.find(
                              (bundle) => bundle.id === selectedBundle
                            )!.refill.bundle.coverage.length -
                              1 && <Col>{'\u2022'}</Col>}
                        </>
                      ))}
                  </Row>
                </Col>
              </Row>
            )
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Bundles;
