import React from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Country, Prisma } from '@prisma/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import Link from 'next/link';
import styles from './StepOne.module.scss';
import RoamingCountries from '../Bundles/RoamingCountries';

const StepOne = ({
  plan,
  countries,
}: {
  plan: Prisma.PlanGetPayload<{
    include: {
      user: true;
      refill: {
        include: {
          bundle: true;
        };
      };
      country: true;
      planModel: {
        include: {
          refill: {
            include: {
              bundle: true;
            };
          };
        };
      };
    };
  }> | null;
  countries: Country[];
}) => {
  if (!plan)
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation={'border'} />
      </div>
    );

  return (
    <Container className="w-100">
      <Row>
        <Col>
          {plan.countryId ? (
            <Row>
              <Col>
                <strong className={styles.strongText}>מדינה:</strong>
                <span className={styles.data}>{plan.country?.translation}</span>
              </Col>
            </Row>
          ) : null}
          <Row>
            <Col>
              <strong className={styles.strongText}>נפח:</strong>
              <span className={styles.data}>
                {Math.floor((plan.refill?.amount_mb || 0) / 1024)} ג&quot;ב
              </span>
            </Col>
          </Row>
          <Row>
            <Col>
              <strong className={styles.strongText}>ימים:</strong>
              <span
                className={`${styles.data}${
                  plan.refill?.amount_days ? '' : ` ${styles.infinitySign}`
                }`}
              >
                {plan.refill?.amount_days ?? (
                  <FontAwesomeIcon icon={solid('infinity')} />
                )}
              </span>
            </Col>
          </Row>
          <Row>
            <Col>
              <strong className={styles.strongText}>לתשלום:</strong>
              <span className={styles.data}>
                {'\u20AA'}
                {plan.price}
              </span>
            </Col>
          </Row>
        </Col>
        <Col className="d-flex flex-column justify-content-end align-items-end">
          <Link href={`/order/edit/${plan.id}`} passHref legacyBehavior>
            <Button className={styles.button} variant="primary">
              לשינוי
            </Button>
          </Link>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <RoamingCountries
            countriesList={countries}
            selectedBundle={plan.planModel}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default StepOne;
