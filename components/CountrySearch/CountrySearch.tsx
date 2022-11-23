import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import lookup from 'country-code-lookup';
import { Country } from '@prisma/client';
import styles from './CountrySearch.module.scss';
import text from '../../lib/content/text.json';
import { blurDataPlaceholder } from '../../lib/content/blurDataUri';
import LoadingRings from '../../public/rings.svg';
import SearchAutocomplete from '../SearchAutocomplete/SearchAutocomplete';

export type ExtendedCountry = {
  name?: string;
  translation?: string;
  displayValue: string;
  id: string;
  iso2?: string;
};

type CountrySearchProps = {
  countriesList: Country[];
  onSelect: (country: ExtendedCountry | null) => void;
};

const CountrySearchItem = ({
  item,
  selectItem,
  selectedItem,
}: {
  item: ExtendedCountry;
  selectItem: (item: ExtendedCountry) => void;
  selectedItem: ExtendedCountry | null;
}) => (
  <div
    onClick={() => selectItem(item)}
    role="option"
    aria-selected={selectedItem?.id === item.id}
    key={item.id}
    className={`${styles.item} d-flex`}
  >
    <div
      style={{
        width: '30px',
        height: '30px',
        position: 'relative',
      }}
    >
      {item.iso2 ? (
        <Image
          src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${item.iso2.toUpperCase()}.svg`}
          placeholder="blur"
          blurDataURL={blurDataPlaceholder}
          layout="intrinsic"
          width="30px"
          height="30px"
          alt={item.displayValue}
        />
      ) : null}
    </div>
    <div className={`${styles.itemName}`}>{item.displayValue}</div>
  </div>
);

const CountrySearch = ({ countriesList, onSelect }: CountrySearchProps) => {
  const [itemSelected, setItemSelected] = useState<ExtendedCountry | null>(
    null
  );
  const [items, setItems] = useState<ExtendedCountry[]>([]);
  const [countryMapError, setCountryMapError] = useState<boolean>(false);
  const [countryFlagError, setCountryFlagError] = useState<boolean>(false);
  const [countryMapLoading, setCountryMapLoading] = useState<boolean>(false);

  useEffect(() => {
    const itemsArr: ExtendedCountry[] = countriesList.map((value) => ({
      name: value.name,
      translation: value.translation,
      displayValue: `${value.translation} (${value.name})`,
      iso2: lookup.byCountry(value.name!)?.iso2,
      id: value.name,
    }));
    setItems(itemsArr);
  }, [countriesList]);

  const handleSelect = (item: ExtendedCountry) => {
    setItemSelected(item);
    onSelect(item);
    setCountryMapLoading(true);
  };

  const handleCancel = () => {
    setItemSelected(null);
    onSelect(null);
    setCountryMapError(false);
    setCountryFlagError(false);
  };

  const getRandomTextPhrase = () =>
    text.countrySearch.phrases[
      Math.floor(Math.random() * text.countrySearch.phrases.length)
    ];

  const cachedTextPhrased = useMemo(() => getRandomTextPhrase(), [
    itemSelected,
  ]);

  return (
    <>
      <SearchAutocomplete
        onSelect={handleSelect}
        onCancel={handleCancel}
        items={items}
        ItemComponent={CountrySearchItem}
        placeholder="לאן טסים?"
        searchFields={['name', 'translation']}
      />
      {itemSelected ? (
        <div
          className={`${styles.selectionContainer} d-flex flex-column w-100 align-items-center text-center p-2`}
        >
          <div className="mt-1 mb-3">
            <h4>
              {itemSelected.displayValue}? {cachedTextPhrased}
            </h4>
          </div>
          <div
            className={`${styles.selectionMedia} d-flex justify-content-between w-100`}
          >
            <div
              className={`position-relative ${
                countryFlagError ? 'w-100' : 'w-50'
              } ${countryMapError ? 'd-none' : ''} h-100`}
            >
              {countryMapLoading && <LoadingRings />}
              <Image
                src={`https://mapsvg.com/static/maps/geo-calibrated/${itemSelected.name
                  ?.toLowerCase()
                  .replace(' ', '-')}.svg`}
                placeholder="blur"
                blurDataURL={blurDataPlaceholder}
                layout="fill"
                className={styles.countryMapImage}
                objectFit="contain"
                onLoadingComplete={() => setCountryMapLoading(false)}
                onError={() => setCountryMapError(true)}
                alt={`Map of ${itemSelected.name}`}
              />
            </div>
            <motion.div
              className={`position-relative ${
                countryMapError ? 'w-100' : 'w-50'
              } ${countryFlagError ? 'd-none' : ''} h-100`}
              layout
            >
              <Image
                src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${itemSelected.iso2?.toUpperCase()}.svg`}
                placeholder="blur"
                blurDataURL={blurDataPlaceholder}
                layout="fill"
                alt={itemSelected.displayValue}
                onError={() => setCountryFlagError(true)}
              />
            </motion.div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CountrySearch;
