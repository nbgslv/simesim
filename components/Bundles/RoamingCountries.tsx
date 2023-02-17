import React from 'react';
import { Accordion, Col, Row } from 'react-bootstrap';
import { Country } from '@prisma/client';
import styles from './RoamingCountries.module.scss';
// eslint-disable-next-line import/no-cycle
import { BundlesList } from './Bundles';

const RoamingCountries = ({
  selectedBundle,
  countriesList,
}: {
  selectedBundle?: BundlesList;
  countriesList: Country[];
}) => {
  if (!selectedBundle) return null;

  return (
    <Accordion className={styles.countriesAccordion}>
      <Accordion.Header>
        טסים למדינות נוספות? הכרטיס יהיה תקף גם במעבר למדינות הבאות:
      </Accordion.Header>
      <Accordion.Body>
        <Row className={`text-center ${styles.whiteSpaceNowrap}`}>
          {selectedBundle.refill.bundle.coverage.map((country, i) => (
            <>
              <Col key={country}>
                {
                  countriesList.find(
                    (countryOfCountriesList) =>
                      countryOfCountriesList.name === country
                  )?.translation
                }
              </Col>
              {i !== selectedBundle.refill.bundle.coverage.length - 1 && (
                <Col>{'\u2022'}</Col>
              )}
            </>
          ))}
        </Row>
      </Accordion.Body>
    </Accordion>
  );
};

export default RoamingCountries;
