import React, { ReactNode, useEffect, useRef } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useAnimation, Variants } from 'framer-motion';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMediaQuery } from 'react-responsive';
import styles from './CheckPhoneSection.module.scss';
import SearchAutocomplete, {
  DefaultCountrySearchItemProps,
  Item,
} from '../SearchAutocomplete/SearchAutocomplete';
import SectionComponent from '../Section/Section';
import { gtagEvent } from '../../lib/gtag';
import { fbpEvent } from '../../lib/fbpixel';

type Brand = {
  exceptions: string[];
  models: string[];
  title: string;
};

export type PhonesList = {
  type: string;
  brands: Brand[];
};

type ListItem = {
  id: string;
  displayValue: string;
};

type BrandListItem = ListItem & {
  exceptions: string;
};

type PhoneListItem = ListItem & {
  brand: string;
};

const CheckPhoneSection = ({ phonesList }: { phonesList: PhonesList[] }) => {
  const [phonesBrands, setPhonesBrands] = React.useState<BrandListItem[]>([]);
  const [phones, setPhones] = React.useState<PhoneListItem[]>([]);
  const [filteredPhones, setFilteredPhones] = React.useState<PhoneListItem[]>(
    []
  );
  const [
    selectedBrand,
    setSelectedBrand,
  ] = React.useState<BrandListItem | null>(null);
  const [
    selectedPhone,
    setSelectedPhone,
  ] = React.useState<PhoneListItem | null>(null);
  const phoneSearchRef = useRef<any>(null);
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });
  const controls = useAnimation();

  const ListBox = ({ children }: { children: ReactNode | ReactNode[] }) => {
    const variants = {
      initial: {
        height: 0,
        transition: {
          when: 'afterChildren',
        },
      },
      show: {
        height: 'fit-content',
        transition: {
          when: 'beforeChildren',
          staggerChildren: 0.5,
        },
      },
    };

    return (
      <AnimatePresence>
        <div className={styles.listBoxContainer}>
          <motion.div
            layout="position"
            initial="initial"
            animate="show"
            exit="initial"
            variants={variants}
            role="listbox"
            className={`${styles.listBox}`}
            id="autocomplete-listbox-check-phone"
            aria-label="phone brand"
            aria-busy="true"
          >
            {children}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  };

  const ListBoxItem = ({
    item,
    selectItem,
    selectedItem,
    index,
  }: DefaultCountrySearchItemProps<Item<PhoneListItem>>) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="option"
      aria-posinset={index + 1}
      aria-selected={selectedItem?.id === item.id}
      className={`${styles.listBoxItem}`}
      onClick={() => selectItem(item)}
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

  useEffect(() => {
    (async () => {
      await controls.start('start');
    })();
  }, []);

  useEffect(() => {
    const brandsArray: BrandListItem[] = [];
    const phonesArray: PhoneListItem[] = [];
    const index = 0;
    phonesList.forEach((list) => {
      list.brands.forEach((brand, id) => {
        brandsArray.push({
          id: id.toString(),
          displayValue: brand.title,
          exceptions: brand.exceptions ? brand.exceptions.toString() : '',
        });
        brand.models.forEach((model) => {
          phonesArray.push({
            id: (index + 1).toString(),
            displayValue: model,
            brand: brand.title,
          });
        });
      });
    });
    setPhonesBrands(brandsArray);
    setPhones(phonesArray);
  }, [phonesList]);

  useEffect(() => {
    if (selectedBrand) {
      setFilteredPhones(
        phones.filter((phone) => phone.brand === selectedBrand.displayValue)
      );
    }
  }, [selectedBrand, phones]);

  const handleBrandSelect = (brand: BrandListItem) => {
    if (brand && brand.displayValue) {
      fbpEvent('Search', {
        content_category: 'phone_brand_search',
        search_string: brand.displayValue,
      });
      gtagEvent({
        action: 'search',
        parameters: {
          search_term: brand.displayValue,
        },
      });
    }
    setSelectedBrand(brand);
  };

  const handleBrandCancel = () => {
    setSelectedBrand(null);
    setSelectedPhone(null);
    setFilteredPhones([]);
    if (phoneSearchRef.current) {
      phoneSearchRef.current.handleCancel();
    }
  };

  const handlePhoneSelect = (phone: PhoneListItem) => {
    if (phone && phone.displayValue) {
      fbpEvent('Search', {
        content_category: 'phone_model',
        search_string: phone.displayValue,
      });
      gtagEvent({
        action: 'search',
        parameters: {
          search_term: phone.displayValue,
        },
      });
    }
    setSelectedPhone(phone);
  };

  const handlePhoneCancel = () => {
    setSelectedPhone(null);
  };

  const getResultText = () => {
    if (selectedBrand && selectedPhone) {
      return (
        <div className="h-100 w-100 d-flex flex-column justify-content-center">
          <div className="d-flex flex-column justify-content-center">
            <div className={styles.resultsContainer} tabIndex={0}>
              מכשיר מדגם זה תומך ב-eSim!
            </div>
          </div>
          <div
            className={`${styles.iconSuccess} h-100 w-100 position-relative`}
          >
            <FontAwesomeIcon icon={solid('check')} />
            <Button
              href="/#bundles-section"
              variant="primary"
              className={styles.orderButton}
            >
              לקנייה
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

  const getRandomDelay = () => -(Math.random() * 0.7 + 0.05);

  const randomDuration = () => Math.random() * 0.07 + 0.23;

  const variants: Variants = {
    start: {
      rotate: [-1, 1.3, 0],
      transition: {
        delay: getRandomDelay(),
        repeat: 5,
        duration: randomDuration(),
        repeatType: 'reverse',
      },
    },
  };

  const handleAnimationComplete = () => {
    setTimeout(async () => {
      await controls.start('start');
    }, 1000);
  };

  return (
    <SectionComponent
      id="check-phone-section"
      title={'הטלפון שלי תומך ב-eSim?'}
      className={styles.main}
    >
      <Row className={`w-100 d-flex align-items-center ${styles.mainRow}`}>
        <Col
          className={`d-flex flex-column h-100 ${
            selectedBrand ? 'justify-content-start' : 'justify-content-center'
          } position-relative`}
        >
          <motion.div layout="position">
            <div className={styles.titleWrapper}>
              <h2 className={styles.title}>הטלפון שלך</h2>
            </div>
            <div className={styles.brandSearch}>
              <SearchAutocomplete
                placeholder={'של איזו חברה?'}
                onSelect={handleBrandSelect}
                onCancel={handleBrandCancel}
                ListBoxComponent={ListBox}
                ItemComponent={ListBoxItem}
                items={phonesBrands}
                ariaControls="autocomplete-listbox-check-phone"
              />
            </div>
            {selectedBrand && (
              <motion.div layout="position" className={styles.modelSearch}>
                <SearchAutocomplete
                  placeholder={'איזה דגם?'}
                  onSelect={handlePhoneSelect}
                  onCancel={handlePhoneCancel}
                  items={filteredPhones}
                  ref={phoneSearchRef}
                  ListBoxComponent={ListBox}
                  ItemComponent={ListBoxItem}
                  ariaControls="autocomplete-listbox-check-phone"
                />
              </motion.div>
            )}
          </motion.div>
          {selectedBrand && selectedPhone && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center h-100 d-flex flex-column justify-content-center align-items-center"
            >
              {getResultText()}
            </motion.div>
          )}
          <div className={styles.disclaimer} tabIndex={0}>
            <small style={{ fontSize: '0.7rem' }}>
              שימו לב: רשימת המכשירים התומכים בטכנולוגיית eSim מסופקת על ידי צד
              ג&apos;. מומלץ לקרוא את{' '}
              <a href="/terms" target="_blank">
                תנאי השימוש באתר
              </a>{' '}
              בעת הסתמכות על רשימה זו.
            </small>
          </div>
        </Col>
        {!isMobile && (
          <Col className="w-100 h-100 p-6">
            <motion.div
              variants={variants}
              animate={controls}
              onAnimationComplete={handleAnimationComplete}
              className="w-100 h-100 d-flex justify-content-center align-items-center position-relative"
            >
              <Image src="/phone.svg" alt={'phone'} layout="fill" />
            </motion.div>
          </Col>
        )}
      </Row>
      <Row>
        <Col className="d-flex justify-content-center">
          <Link href="/supported_devices" passHref legacyBehavior>
            <Button className={styles.moreButton} variant="primary">
              לרשימה המלאה
            </Button>
          </Link>
        </Col>
      </Row>
    </SectionComponent>
  );
};

export default CheckPhoneSection;
