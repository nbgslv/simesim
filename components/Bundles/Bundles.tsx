import React, { useEffect } from 'react';
import { Country, PlanModel, Prisma } from '@prisma/client';
import styles from './Bundles.module.scss';
import RoamingCountries from './RoamingCountries';
import { gtagEvent } from '../../lib/gtag';
import { fbpEvent } from '../../lib/fbpixel';
import BundlesScroll from './BundlesScroll';

export type BundlesList = PlanModel &
  Prisma.PlanModelGetPayload<{
    include: { refill: { include: { bundle: true } } };
  }>;

const Bundles = ({
  bundlesList,
  onChange,
  countriesList,
  editMode = false,
  currentPlanModelId,
}: {
  bundlesList: BundlesList[];
  onChange: (bundleId: string | null) => void;
  countriesList: Country[];
  editMode?: boolean;
  currentPlanModelId?: string;
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
    { value: string; disabled: boolean; displayValue: string }[]
  >([]);
  const [daysOptions, setDaysOptions] = React.useState<
    { value: string; disabled: boolean; displayValue: string }[]
  >([]);

  useEffect(() => {
    if (currentPlanModelId && editMode) {
      setSelectedBundle(currentPlanModelId);
      const selectedBundleData = bundlesList.find(
        (bundle) => bundle.id === currentPlanModelId
      );
      if (selectedBundleData) {
        setSelectedBundleVolume(selectedBundleData.refill.amount_mb.toString());
        setSelectedBundleDays(
          selectedBundleData.refill.amount_days?.toString() || '0'
        );
      }
    }
  }, [currentPlanModelId, editMode, bundlesList]);

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
          value: option.toString(),
          disabled: false,
          displayValue: `${Math.floor(option / 1024)} ג"ב`,
        }))
      );
      setDaysOptions(
        Array.from(daysOptionsSet).map((option) => ({
          value: option.toString(),
          disabled: false,
          displayValue: `${option?.toString() || '365'} ימים`,
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
          ...option,
          disabled:
            option.value === '365'
              ? !availableDays.includes(null)
              : !availableDays.includes(Number(option.value)),
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
            optionalDays.filter((option) => !option.disabled)[0].value
          );
        }
      }
    }
  }, [selectedBundleVolume]);

  const handleBundleVolumeSelect = (value: string) => {
    fbpEvent('ViewContent', {
      content_category: 'bundle_volume',
      content_name: value,
    });
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
    fbpEvent('ViewContent', {
      content_category: 'bundle_days',
      content_name: value,
    });
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
      <BundlesScroll
        cards={volumeOptions}
        selected={selectedBundleVolume}
        onSelect={handleBundleVolumeSelect}
      />
      <div className="mt-4 mb-md-4">
        <div className="text-center mb-2">לכמה זמן?</div>
        <BundlesScroll
          cards={daysOptions}
          selected={selectedBundleDays}
          onSelect={handleBundleDaysSelect}
        />
      </div>
      {selectedBundle ? (
        <div>
          <div className={styles.price}>
            {'\u20AA'}
            {bundlesList.find((bundle) => bundle.id === selectedBundle)?.price}
          </div>
          {bundlesList.find((bundle) => bundle.id === selectedBundle)?.refill
            .bundle.coverage.length ? (
            <div className="mb-4">
              <RoamingCountries
                countriesList={countriesList}
                selectedBundle={bundlesList.find(
                  (bundle) => bundle.id === selectedBundle
                )}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Bundles;
