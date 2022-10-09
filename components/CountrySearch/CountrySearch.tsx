import React, {useEffect, useRef, useState} from 'react';
import lookup from 'country-code-lookup';
import styles from './CountrySearch.module.scss';
import closeIcon from '../../public/close.png';
import Image from "next/image";

type Country = {
    name: string,
    id: string,
    iso2?: string
}

const CountrySearch = ({ countriesList }: { countriesList: string[] }) => {
    const [query, setQuery] = useState<string>('');
    const [items, setItems] = useState<Country[]>([]);
    const [filteredItems, setFilteredItems] = useState<Country[]>([]);
    const [itemSelected, setItemSelected] = useState<Country | null>(null)
    const mainInputRef = useRef<HTMLInputElement>(null)

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
    }

    const handleCancel = () => {
        setItemSelected(null)
        setFilteredItems([])
        setQuery('')
    }

    return (
        <div className={styles.main}>
            <div className={styles.container}>
                <input
                    ref={mainInputRef}
                    placeholder={'לאן טסים?'}
                    className={styles.mainInput}
                    type="text"
                    value={itemSelected ? itemSelected.name : query}
                    onChange={handleChange}
                />
                <button type="button" aria-label="Clear" className={`${styles.cancelButton}`} onClick={handleCancel}><Image width={20} height={20} src={closeIcon} /></button>
            </div>
            {filteredItems.length && (
                <div role="listbox" className={`${styles.listBox}`}>
                    {
                        filteredItems.length ? filteredItems.map((item) => {
                            return (
                                <div onClick={() => handleSelect(item)} role="option" key={item.id} className={`${styles.item}`}>
                                    {item.iso2 ? <img src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${item.iso2.toUpperCase()}.svg`} width="40px" alt={item.name} /> : <span style={{ width: '100px' }}></span>}
                                    <span className={`${styles.itemName}`}>{item.name}</span>
                                </div>
                            )
                        }) : null
                    }
                </div>
            )}
        </div>
    );
};

export default CountrySearch
