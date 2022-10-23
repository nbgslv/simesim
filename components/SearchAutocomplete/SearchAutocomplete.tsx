import React, {useEffect, useRef, useState} from 'react';
import {motion} from "framer-motion";
import CloseIcon from "../../public/close.svg";
import styles from "./SearchAutocomplete.module.scss";

export type Item<T> = T & {
    id: string | number,
    displayValue: string
}

type SearchAutocompleteProps<T> = {
    maxResults?: number,
    onSelect: (item: any) => void,
    onCancel: () => void,
    placeholder?: string,
    items: Item<T>[],
    itemComponent?: (item: any, selectItem: (item: any) => void) => JSX.Element,
    onQueryChange?: (query: string) => void,
}

const DefaultCountrySearchItem = <T extends object>(item: Item<T>, selectItem: (item: Item<T>) => void) => {
    return (
        <div
            role="option"
            onClick={() => selectItem(item)}
            key={item.id}
        >
            <div>
                {item.displayValue}
            </div>
        </div>
    )
}

const SearchAutocomplete = <T extends object>({
    maxResults = 5,
    onSelect,
    onCancel,
    placeholder = undefined,
    items,
    itemComponent = DefaultCountrySearchItem,
    onQueryChange
}: SearchAutocompleteProps<T>) => {
    const [itemSelected, setItemSelected] = useState<Item<T> | null>(null)
    const [query, setQuery] = useState<string>('');
    const [filteredItems, setFilteredItems] = useState<Item<T>[]>([]);
    const mainInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (query) {
            const filteredItemsArr = items.filter((item) => item.displayValue.toLowerCase().includes(query.toLowerCase()))
            setFilteredItems(filteredItemsArr)
        } else {
            setFilteredItems([])
        }
    }, [query])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (itemSelected && e.target.value !== itemSelected.displayValue) {
            setItemSelected(null)
        }
        setQuery(e.target.value)
        if (onQueryChange) {
            onQueryChange(e.target.value)
        }
    }

    const handleSelect = (item: Item<T>) => {
        setItemSelected(item)
        setFilteredItems([])
        mainInputRef.current?.blur()
        onSelect(item)
    }

    const handleCancel = () => {
        setItemSelected(null)
        setFilteredItems([])
        setQuery('')
        onSelect(null)
        onCancel()
    }

    return (
        <>
            <div className="position-relative">
                <input
                    ref={mainInputRef}
                    placeholder={placeholder}
                    className={styles.mainInput}
                    type="text"
                    value={itemSelected ? itemSelected.displayValue : query}
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
                            if (index < maxResults) {
                                if (itemComponent) {
                                    return itemComponent(item, handleSelect)
                                }
                            }
                        })
                    }
                </div>
            ) : null}
        </>
    );
};

export default SearchAutocomplete;
