import React, {
  ElementType,
  FC,
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Fuse from 'fuse.js';
import CloseIcon from '../../public/close.svg';
import styles from './SearchAutocomplete.module.scss';
import Input from '../Input/Input';
import FuseOptionKey = Fuse.FuseOptionKey;

export type Item<T> = T & {
  id: string | number;
  displayValue: string;
};

type SearchAutocompleteProps<T> = {
  maxResults?: number;
  onSelect: (item: any) => void;
  onCancel: () => void;
  placeholder?: string;
  items: Item<T>[];
  ItemComponent?: ElementType;
  onQueryChange?: (query: string) => void;
  clearSelectedItem?: boolean;
  ListBoxComponent?: ElementType;
  searchFields?: Partial<keyof Item<T>>[];
  ariaLabeledby?: string;
  ariaControls?: string;
};

type DefaultListBoxComponentProps = {
  id?: string;
  children: ReactNode | ReactNode[];
};

export type DefaultCountrySearchItemProps<T> = {
  item: Item<T>;
  selectItem: (item: Item<T>) => void;
  selectedItem: T | null;
  index: number;
};

const SearchAutocompleteInner = <T extends { id: string }>(
  {
    maxResults,
    onSelect,
    onCancel,
    placeholder = undefined,
    items,
    ItemComponent,
    onQueryChange,
    ListBoxComponent,
    searchFields = [],
    ariaLabeledby,
    ariaControls,
  }: SearchAutocompleteProps<T>,
  ref: ForwardedRef<any>
) => {
  const [itemSelected, setItemSelected] = useState<Item<T> | null>(null);
  const [query, setQuery] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<Item<T>[]>([]);
  const [searchInstance, setSearchInstance] = useState<Fuse<Item<T>> | null>(
    null
  );
  const mainInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (items && !searchInstance) {
      setSearchInstance(
        new Fuse(items, {
          keys: [...searchFields, 'displayValue'] as FuseOptionKey<Item<T>>[],
        })
      );
    }
  }, [searchFields, items]);

  useEffect(() => {
    if (searchInstance) {
      searchInstance.setCollection(items);
    }
  }, [searchInstance, items]);

  const DefaultListBoxComponent: FC<DefaultListBoxComponentProps> = ({
    id,
    children,
  }) => {
    const variants = {
      initial: {
        height: 0,
        transition: {
          when: 'afterChildren',
        },
      },
      show: {
        height: 'inherit',
        transition: {
          when: 'beforeChildren',
          staggerChildren: 0.5,
        },
      },
    };

    return (
      <AnimatePresence>
        <div
          className={styles.listBoxContainer}
          role="listbox"
          id={id}
          aria-label={placeholder}
          aria-busy="true"
        >
          <motion.div
            layout="position"
            initial="initial"
            animate="show"
            exit="initial"
            variants={variants}
            className={`${styles.listBox}`}
            tabIndex={0}
          >
            {children}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const DefaultItemComponent: FC<DefaultCountrySearchItemProps<T>> = ({
    item,
    selectItem,
    selectedItem,
    index,
  }) => {
    if (!item) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        aria-posinset={index}
        aria-selected={selectedItem?.id === item.id}
        role="option"
        onClick={() => selectItem(item)}
        key={item.id}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            selectItem(item);
          }
        }}
      >
        {item.displayValue}
      </motion.div>
    );
  };

  useEffect(() => {
    if (query && searchInstance) {
      const filteredItemsArr = searchInstance
        .search(query)
        .map(({ item }) => item);
      setFilteredItems(filteredItemsArr);
    } else {
      setFilteredItems([]);
    }
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (itemSelected && e.target.value !== itemSelected.displayValue) {
      setItemSelected(null);
    }
    setQuery(e.target.value);
    if (onQueryChange) {
      onQueryChange(e.target.value);
    }
  };

  const handleSelect = (item: Item<T>) => {
    setItemSelected(item);
    setFilteredItems([]);
    mainInputRef.current?.blur();
    onSelect(item);
  };

  const handleCancel = () => {
    setItemSelected(null);
    setFilteredItems([]);
    setQuery('');
    onSelect(null);
    onCancel();
  };

  useImperativeHandle(ref, () => ({
    handleCancel() {
      setItemSelected(null);
      setFilteredItems([]);
      setQuery('');
      onSelect(null);
      onCancel();
    },
    handleSelect(item: Item<T>) {
      setItemSelected(item);
      setFilteredItems([]);
      mainInputRef.current?.blur();
      onSelect(item);
    },
    mainInputRef,
  }));

  return (
    <>
      <div className="position-relative">
        <Input
          ref={mainInputRef}
          placeholder={placeholder}
          value={itemSelected ? itemSelected.displayValue : query}
          onChange={handleChange}
          ariaLabeledby={ariaLabeledby}
          ariaControls={ariaControls}
          ariaRole="combobox"
          ariaExpanded={filteredItems.length > 0}
          ariaAutocomplete="list"
        />
        <button
          type="button"
          aria-label="Clear"
          className={`${styles.cancelButton}`}
          onClick={handleCancel}
        >
          <motion.div
            style={{
              boxShadow: 'none',
              borderRadius: '50%',
            }}
            whileHover={{
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
            }}
            whileTap={{
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <CloseIcon aria-label="Clear Field" />
          </motion.div>
        </button>
      </div>
      {/* eslint-disable-next-line no-nested-ternary */}
      {filteredItems.length ? (
        ListBoxComponent ? (
          <ListBoxComponent>
            {filteredItems.slice(0, maxResults).map((item, i) => {
              const ItemComponentToUse = ItemComponent || DefaultItemComponent;
              return (
                <ItemComponentToUse
                  key={i}
                  index={i}
                  item={item}
                  selectItem={handleSelect}
                />
              );
            })}
          </ListBoxComponent>
        ) : (
          <DefaultListBoxComponent id={ariaControls}>
            {filteredItems.map((item, i) => {
              const ItemComponentToUse = ItemComponent || DefaultItemComponent;
              if (maxResults && i < maxResults)
                return (
                  <ItemComponentToUse
                    key={i}
                    item={item}
                    selectItem={handleSelect}
                    selectedItem={itemSelected}
                  />
                );
              return (
                <ItemComponentToUse
                  key={i}
                  item={item}
                  selectItem={handleSelect}
                  selectedItem={itemSelected}
                />
              );
            })}
          </DefaultListBoxComponent>
        )
      ) : null}
    </>
  );
};

const SearchAutocomplete = forwardRef(SearchAutocompleteInner) as <
  T extends { id: string }
>(
  props: SearchAutocompleteProps<T> & { ref?: MutableRefObject<any> }
) => JSX.Element;

export default SearchAutocomplete;
