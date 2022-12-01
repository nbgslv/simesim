import lookup from 'country-code-lookup';
import React, { useEffect } from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import styles from './CountriesAdminModal.module.scss';
import WorldMap from '../../public/worldMap.svg';

type RefillsAdminModalProps = {
  onHide: () => void;
  countries: string[];
  show: boolean;
};

const CountriesAdminModal = ({
  show,
  onHide,
  countries,
}: RefillsAdminModalProps) => {
  const [countriesIso2, setCountriesIso2] = React.useState<Record<
    string,
    string | undefined
  > | null>(null);
  const [showTooltip, setShowTooltip] = React.useState<string>('');

  useEffect(() => {
    if (countriesIso2 && Object.keys(countriesIso2).length > 0) {
      countries.forEach((country) => {
        const path = document.getElementById(countriesIso2[country] || '');
        if (path) {
          path.addEventListener('mouseover', () => {
            setShowTooltip(country);
          });
          path.addEventListener('mouseout', () => {
            setShowTooltip('');
          });
          path.classList.add(styles.active);
        }
      });
    }
  }, [countriesIso2]);

  useEffect(() => {
    const countriesIso2Object: Record<string, string | undefined> = {};
    countries.forEach((country) => {
      const countryIso2 = lookup.byCountry(country)?.iso2;
      if (countryIso2) {
        countriesIso2Object[country] = countryIso2;
      }
    });
    setCountriesIso2(countriesIso2Object);
  }, [countries, show]);

  return (
    <Modal
      className={styles.main}
      show={show}
      onHide={onHide}
      scrollable
      dir="ltr"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Bundle&apos;s Countries</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {countries.length > 0 ? (
          <div className={styles.container}>
            <Row className={styles.tooltipContainer}>
              <Col>{showTooltip}</Col>
            </Row>
            <Row>
              <Col className={styles.mapContainer}>
                <WorldMap width="700" height="450" />
              </Col>
            </Row>
            <Row>
              <Col className={styles.countryNames}>
                {countries.map((country, i) => {
                  if (i < countries.length && i !== countries.length - 1)
                    return (
                      <>
                        <span key={country}>{country}</span>
                        {' \u2022 '}
                      </>
                    );
                  return <span key={country}>{country}</span>;
                })}
              </Col>
            </Row>
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
};

export default CountriesAdminModal;
