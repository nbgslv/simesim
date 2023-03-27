import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Country, Prisma } from '@prisma/client';
import styles from '../../../styles/finish.module.scss';
import MainLayout from '../../../components/Layouts/MainLayout';
import Section from '../../../components/Checkout/Section';
import StepOne from '../../../components/Checkout/StepOne';
import StepTwo from '../../../components/Checkout/StepTwo';
import PaymentGate from '../../../components/Payment/PaymentGate/PaymentGate';

const Id = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<Prisma.PlanGetPayload<{
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
  }> | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const router = useRouter();
  const { id } = router.query;
  const stepTwoRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      (async () => {
        const currentBundleResponse = await fetch(
          `/api/order/${id}?action=finish`
        );
        const currentBundleJson = await currentBundleResponse.json();
        setPlan(currentBundleJson.data);
      })();
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      const countriesListResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/country`
      );
      const countriesListJson = await countriesListResponse.json();
      setCountries(countriesListJson.data.countries);
    })();
  }, []);

  return (
    <MainLayout title="הזמנה" hideJumbotron showExitIntent>
      <div className={styles.main}>
        <Container className={styles.container}>
          <Section
            title="פרטי החבילה"
            open={step === 0}
            onClickHandler={() => step > 0 && setStep(0)}
          >
            <StepOne plan={plan} countries={countries} />
          </Section>
          <Section
            title="פרטים אישיים"
            open={step === 1}
            onClickHandler={() => step > 1 && setStep(1)}
          >
            <StepTwo
              handleValid={async (data) => {
                setLoading(true);
                setTimeout(() => {
                  setStep(step + 1);
                  setLoading(false);
                }, 10000);
              }}
              handleErrors={async (errors) => console.log(errors)}
              ref={stepTwoRef}
              user={plan?.user ?? null}
            />
          </Section>
          <Section
            title="תשלום"
            open={step === 2}
            onClickHandler={() => step > 2 && setStep(2)}
          >
            <PaymentGate />
          </Section>
          <motion.div layout="position">
            <Button
              variant="primary"
              onClick={async () => {
                if (step === 1) {
                  const formSubmit = await stepTwoRef.current?.handleSubmit?.();
                  formSubmit?.();
                } else {
                  setStep(step + 1);
                }
              }}
              className={styles.button}
              disabled={loading}
            >
              {loading ? (
                <div className="d-flex justify-content-center align-items-center">
                  <Spinner
                    animation="border"
                    size="sm"
                    style={{ color: '#fff' }}
                  />
                </div>
              ) : (
                'שלב הבא'
              )}
            </Button>
          </motion.div>
        </Container>
      </div>
    </MainLayout>
  );
};

export default Id;
