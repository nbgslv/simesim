import React, {
    ElementType,
    FC, ForwardedRef,
    forwardRef,
    MutableRefObject, ReactNode,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import CloseIcon from "../../public/close.svg";
import styles from "./SearchAutocomplete.module.scss";
import Input from "../Input/Input";
import Fuse from "fuse.js";
import FuseOptionKey = Fuse.FuseOptionKey;

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
    ItemComponent?: ElementType,
    onQueryChange?: (query: string) => void,
    clearSelectedItem?: boolean,
    focusedBorderColor?: string,
    ListBoxComponent?: ElementType,
    searchFields?: Partial<keyof Item<T>>[]
}

type DefaultListBoxComponentProps = {
    children: ReactNode | ReactNode[],
}

type DefaultCountrySearchItemProps<T> = {
    item: Item<T>,
    selectItem: (item: Item<T>) => void
}

const SearchAutocompleteInner = <T extends object>({
    maxResults = 5,
    onSelect,
    onCancel,
    placeholder = undefined,
    items,
    ItemComponent,
    onQueryChange,
    focusedBorderColor = '#fff',
    ListBoxComponent,
    searchFields = []
}: SearchAutocompleteProps<T>, ref: ForwardedRef<any>) => {
    const [itemSelected, setItemSelected] = useState<Item<T> | null>(null)
    const [query, setQuery] = useState<string>('');
    const [filteredItems, setFilteredItems] = useState<Item<T>[]>([]);
    const [searchInstance, setSearchInstance] = useState<Fuse<Item<T>>>(null)
    const mainInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (items && !searchInstance) {
            setSearchInstance(
                new Fuse(items, {
                    keys: [...searchFields, 'displayValue'] as FuseOptionKey<Item<T>>[]
                })
            )
        }
    }, [searchFields, items])

    useEffect(() => {
        if (searchInstance) {
            searchInstance.setCollection(items)
        }
    }, [searchInstance, items])

    const DefaultListBoxComponent: FC<DefaultListBoxComponentProps> = ({ children }) => {
        const variants = {
            initial: {
                height: 0,
                transition: {
                    when: 'afterChildren',
                }
            },
            show: {
                height: 'fit-content',
                transition: {
                    when: 'beforeChildren',
                    staggerChildren: 0.5,
                }
            }
        }

        return (
            <AnimatePresence>
                <motion.div
                    layout
                    initial="initial"
                    animate="show"
                    exit="initial"
                    variants={variants}
                    role="listbox"
                    className={`${styles.listBox}`}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        )
    }

    const DefaultItemComponent: FC<DefaultCountrySearchItemProps<T>> = ({ item, selectItem }) => {
        if (!item) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="option"
                onClick={() => selectItem(item)}
                key={item.id}
            >
                {item.displayValue}
            </motion.div>
        )
    }

    useEffect(() => {
        if (query && searchInstance) {
            console.log({ all: searchInstance.getIndex(), search: searchInstance.search(query) })
            const filteredItemsArr = searchInstance.search(query).map(({ item }) => item)
            setFilteredItems(filteredItemsArr.slice(0, maxResults))
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

    useImperativeHandle(ref, () => ({
        handleCancel() {
            setItemSelected(null)
            setFilteredItems([])
            setQuery('')
            onSelect(null)
            onCancel()
        }
    }))

    return (
        <>
            <div className="position-relative">
                <Input
                    ref={mainInputRef}
                    placeholder={placeholder}
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
                ListBoxComponent ?
                    <ListBoxComponent children={filteredItems.slice(0, maxResults).map((item, i) => {
                        const ItemComponentToUse = ItemComponent || DefaultItemComponent
                        return (
                            <ItemComponentToUse key={i} item={item} selectItem={handleSelect} />
                        )
                    })} />
                    : <DefaultListBoxComponent>
                        {filteredItems.map((item, i) => {
                            const ItemComponentToUse = ItemComponent || DefaultItemComponent
                            if (i < maxResults)
                                return (
                                    <ItemComponentToUse key={i} item={item} selectItem={handleSelect} />
                                )
                        })}
                    </DefaultListBoxComponent>
            ) : null}
        </>
    );
};

const SearchAutocomplete = forwardRef(SearchAutocompleteInner) as <T extends object>(props: SearchAutocompleteProps<T> & { ref?: MutableRefObject<any> }) => JSX.Element;

export default SearchAutocomplete;
