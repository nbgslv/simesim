import React, {useEffect, useMemo, useRef, useState} from 'react';
import lookup from 'country-code-lookup';
import styles from './CountrySearch.module.scss';
import CloseIcon from '../../public/close.svg';
import Image from "next/image";
import { motion } from 'framer-motion';
import text from '../../lib/content/text.json'
import {blurDataPlaceholder} from "../../lib/content/blurDataUri";
import LoadingRings from '../../public/rings.svg'

export type Country = {
    name: string,
    id: string,
    iso2?: string
}

type CountrySearchProps = {
    countriesList: { [key: string]: string },
    onSelect: (country: Country | null) => void
}

const CountrySearch = ({ countriesList, onSelect }: CountrySearchProps) => {
    const [query, setQuery] = useState<string>('');
    const [items, setItems] = useState<Country[]>([]);
    const [filteredItems, setFilteredItems] = useState<Country[]>([]);
    const [itemSelected, setItemSelected] = useState<Country | null>(null)
    const [countryMapError, setCountryMapError] = useState<boolean>(false)
    const [countryFlagError, setCountryFlagError] = useState<boolean>(false)
    const [countryMapLoading, setCountryMapLoading] = useState<boolean>(false)
    const mainInputRef = useRef<HTMLInputElement>(null)
    const MAX_RESULTS = 5;

    useEffect(() => {
        const itemsArr = Object
            .entries(countriesList)
            .map((value) => {
                return {
                    name: value[1],
                    iso2: lookup.byCountry(value[1])?.iso2,
                    id: value[0]
                }
            })
        setItems(itemsArr)
    }, [countriesList])

    useEffect(() => {
        if (query) {
            const filteredItemsArr = items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
            setFilteredItems(filteredItemsArr)
        } else {
            setFilteredItems([])
        }
    }, [query])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (itemSelected && e.target.value !== itemSelected.name) {
            setItemSelected(null)
        }
        setQuery(e.target.value)
    }

    const handleSelect = (item: Country) => {
        setItemSelected(item)
        setFilteredItems([])
        mainInputRef.current?.blur()
        onSelect(item)
        setCountryMapLoading(true)
    }

    const handleCancel = () => {
        setItemSelected(null)
        setFilteredItems([])
        setQuery('')
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
            <div className={styles.container}>
                <input
                    ref={mainInputRef}
                    placeholder={'לאן טסים?'}
                    className={styles.mainInput}
                    type="text"
                    value={itemSelected ? itemSelected.name : query}
                    onChange={handleChange}
                />
                <button type="button" aria-label="Clear" className={`${styles.cancelButton}`} onClick={handleCancel}>
                    <motion.div
                        style={{
                            boxShadow: 'none',
                            borderRadius: '50%'
                        }}
                        whileHover={{
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)'
                        }}
                        whileTap={{
                            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        <CloseIcon />
                    </motion.div>
                </button>
            </div>
            {filteredItems.length ? (
                <div role="listbox" className={`${styles.listBox}`}>
                    {
                        filteredItems.map((item, index) => {
                            if (index < MAX_RESULTS) {
                                return (
                                    <div onClick={() => handleSelect(item)} role="option"
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
                                                alt={item.name}/> : null}
                                        </div>
                                        <div className={`${styles.itemName}`}>{item.name}</div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            ) : null}
            {itemSelected ? (
                <div className={`${styles.selectionContainer} d-flex flex-column w-100 align-items-center text-center p-2`}>
                    <div className="mt-1 mb-3">
                        <h4>{itemSelected.name}? {cachedTextPhrased}</h4>
                    </div>
                    <div className={`${styles.selectionMedia} d-flex justify-content-between w-100`}>
                        <div className={`position-relative ${countryFlagError ? 'w-100' : 'w-50'} ${countryMapError ? 'd-none' : ''} h-100`}>
                            {countryMapLoading && <LoadingRings />}
                            <Image src={`https://mapsvg.com/static/maps/geo-calibrated/${itemSelected.name.toLowerCase().replace(' ', '-')}.svg`} placeholder="blur" blurDataURL={blurDataPlaceholder} layout="fill" className={styles.countryMapImage} objectFit="contain" onLoadingComplete={() => setCountryMapLoading(false)} onError={() => setCountryMapError(true)} />
                        </div>
                        <motion.div className={`position-relative ${countryMapError ? 'w-100' : 'w-50'} ${countryFlagError ? 'd-none' : ''} h-100`} layout>
                            <Image src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${itemSelected.iso2?.toUpperCase()}.svg`} placeholder="blur" blurDataURL={blurDataPlaceholder} layout="fill" alt={itemSelected.name} onError={() => setCountryFlagError(true)} />
                        </motion.div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default CountrySearch
