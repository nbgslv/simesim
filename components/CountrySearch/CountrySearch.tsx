import React, {useEffect, useMemo, useState} from 'react';
import lookup from 'country-code-lookup';
import styles from './CountrySearch.module.scss';
import Image from "next/image";
import { motion } from 'framer-motion';
import text from '../../lib/content/text.json'
import {blurDataPlaceholder} from "../../lib/content/blurDataUri";
import LoadingRings from '../../public/rings.svg'
import SearchAutocomplete from "../SearchAutocomplete/SearchAutocomplete";

export type Country = {
    displayValue: string,
    id: string,
    iso2?: string
}

type CountrySearchProps = {
    countriesList: { [key: string]: string },
    onSelect: (country: Country | null) => void
}

const CountrySearchItem = (item: Country, selectItem: (item: Country) => void) => {
    return (
        <div onClick={() => selectItem(item)} role="option"
             key={item.id} className={`${styles.item} d-flex`}>
            <div style={{
                width: '30px',
                height: '30px',
                position: 'relative'
            }}>
                {item.iso2 ? <Image
                    src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${item.iso2.toUpperCase()}.svg`}
                    placeholder="blur" blurDataURL={blurDataPlaceholder}
                    layout="intrinsic" width="30px" height="30px"
                    alt={item.displayValue}/> : null}
            </div>
            <div className={`${styles.itemName}`}>{item.displayValue}</div>
        </div>
    )
}

const CountrySearch = ({ countriesList, onSelect }: CountrySearchProps) => {
    const [itemSelected, setItemSelected] = useState<Country | null>(null)
    const [items, setItems] = useState<Country[]>([]);
    const [countryMapError, setCountryMapError] = useState<boolean>(false)
    const [countryFlagError, setCountryFlagError] = useState<boolean>(false)
    const [countryMapLoading, setCountryMapLoading] = useState<boolean>(false)

    useEffect(() => {
        const itemsArr = Object
            .entries(countriesList)
            .map((value) => {
                return {
                    displayValue: value[1],
                    iso2: lookup.byCountry(value[1])?.iso2,
                    id: value[0]
                }
            })
        setItems(itemsArr)
    }, [countriesList])

    const handleSelect = (item: Country) => {
        setItemSelected(item)
        onSelect(item)
        setCountryMapLoading(true)
    }

    const handleCancel = () => {
        setItemSelected(null)
        onSelect(null)
        setCountryMapError(false)
        setCountryFlagError(false)
    }

    const getRandomTextPhrase = () => {
        return text.countrySearch.phrases[Math.floor(Math.random() * text.countrySearch.phrases.length)]
    }

    const cachedTextPhrased = useMemo(() => getRandomTextPhrase(), [itemSelected])

    return (
        <>
            <SearchAutocomplete onSelect={handleSelect} onCancel={handleCancel} items={items} itemComponent={CountrySearchItem} placeholder="לאן טסים?" />
            {itemSelected ? (
                <div className={`${styles.selectionContainer} d-flex flex-column w-100 align-items-center text-center p-2`}>
                    <div className="mt-1 mb-3">
                        <h4>{itemSelected.displayValue}? {cachedTextPhrased}</h4>
                    </div>
                    <div className={`${styles.selectionMedia} d-flex justify-content-between w-100`}>
                        <div className={`position-relative ${countryFlagError ? 'w-100' : 'w-50'} ${countryMapError ? 'd-none' : ''} h-100`}>
                            {countryMapLoading && <LoadingRings />}
                            <Image src={`https://mapsvg.com/static/maps/geo-calibrated/${itemSelected.displayValue.toLowerCase().replace(' ', '-')}.svg`} placeholder="blur" blurDataURL={blurDataPlaceholder} layout="fill" className={styles.countryMapImage} objectFit="contain" onLoadingComplete={() => setCountryMapLoading(false)} onError={() => setCountryMapError(true)} />
                        </div>
                        <motion.div className={`position-relative ${countryMapError ? 'w-100' : 'w-50'} ${countryFlagError ? 'd-none' : ''} h-100`} layout>
                            <Image src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${itemSelected.iso2?.toUpperCase()}.svg`} placeholder="blur" blurDataURL={blurDataPlaceholder} layout="fill" alt={itemSelected.displayValue} onError={() => setCountryFlagError(true)} />
                        </motion.div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default CountrySearch
