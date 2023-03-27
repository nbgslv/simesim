import React from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Country, Prisma } from '@prisma/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
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
      planModel: true;
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
                <strong>מדינה:</strong>
                <span className={styles.data}>{plan.country?.translation}</span>
              </Col>
            </Row>
          ) : null}
          <Row>
            <Col>
              <strong>נפח:</strong>
              <span className={styles.data}>
                {Math.floor((plan.refill?.amount_mb || 0) / 1024)} ג&quot;ב
              </span>
            </Col>
          </Row>
          <Row>
            <Col>
              <strong>ימים:</strong>
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
              <strong>לתשלום:</strong>
              <span className={styles.data}>
                {'\u20AA'}
                {plan.price}
              </span>
            </Col>
          </Row>
        </Col>
        <Col className="d-flex flex-column justify-content-end align-items-end">
          <Button
            className={styles.button}
            variant="secondary"
            href={`/order/edit/${plan.id}`}
          >
            לשינוי
          </Button>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <RoamingCountries countriesList={countries} selectedBundle={plan} />
        </Col>
      </Row>
    </Container>
  );
};

export default StepOne;
