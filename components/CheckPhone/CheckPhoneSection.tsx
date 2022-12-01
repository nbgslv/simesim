import React, { ReactNode, useCallback, useEffect, useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import Image from 'next/image';
import { AnimatePresence, motion, useAnimation, Variants } from 'framer-motion';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './CheckPhoneSection.module.scss';
import SearchAutocomplete, {
  Item,
} from '../SearchAutocomplete/SearchAutocomplete';
import Section from '../Section/Section';

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
  id: number;
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
  }: {
    item: Item<PhoneListItem>;
    selectItem: (item: Item<PhoneListItem>) => void;
  }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="option"
      className={`${styles.listBoxItem}`}
      onClick={() => selectItem(item)}
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
          id,
          displayValue: brand.title,
          exceptions: brand.exceptions ? brand.exceptions.toString() : '',
        });
        brand.models.forEach((model) => {
          phonesArray.push({
            id: index + 1,
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
            <div className={styles.resultsContainer}>
              מכשיר מדגם זה תומך ב-eSim!
            </div>
          </div>
          <div
            className={`${styles.iconSuccess} h-100 w-100 position-relative`}
          >
            <FontAwesomeIcon icon={solid('check')} />
          </div>
        </div>
      );
    }
    return null;
  };

  const getRandomTransformOrigin = useCallback(() => {
    const value = (16 + 40 * Math.random()) / 100;
    const value2 = (15 + 36 * Math.random()) / 100;
    return {
      originX: value,
      originY: value2,
    };
  }, []);

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
    <Section
      id="check-phone-section"
      title={'הטלפון שלי תומך ב-eSim?'}
      className={styles.main}
    >
      <Row className="h-100 w-100 d-flex align-items-center">
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
          <div className={styles.disclaimer}>
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
        <Col className="w-100 h-100 p-6">
          <motion.div
            style={{
              ...getRandomTransformOrigin(),
            }}
            variants={variants}
            animate={controls}
            onAnimationComplete={handleAnimationComplete}
            className="w-100 h-100 d-flex justify-content-center align-items-center position-relative"
          >
            <Image src="/phone.svg" alt={'phone'} layout="fill" />
          </motion.div>
        </Col>
      </Row>
    </Section>
  );
};

export default CheckPhoneSection;
