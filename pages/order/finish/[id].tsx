import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Country, PlanStatus, Prisma } from '@prisma/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { getCsrfToken } from 'next-auth/react';
import { NextPageContext } from 'next';
import { FieldValues } from 'react-hook-form';
import { toast } from 'react-toastify';
import styles from '../../../styles/finish.module.scss';
import MainLayout from '../../../components/Layouts/MainLayout';
import Section from '../../../components/Checkout/Section';
import StepOne from '../../../components/Checkout/StepOne';
import StepTwo from '../../../components/Checkout/StepTwo';
import ToastContent from '../../../components/Toast/ToastContent';
import { Context, useUserStore } from '../../../lib/context/UserStore';
import { Action } from '../../../lib/reducer/userReducer';
import StepThree from '../../../components/Checkout/StepThree';

enum Steps {
  BUNDLE,
  PERSONAL_DETAILS,
  PAYMENT,
}

const Id = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Steps>(0);
  const [plan, setPlan] = useState<Prisma.PlanGetPayload<{
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
  }> | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const stepSeen = useRef<Record<string, boolean>>(
    Object.values(Steps).reduce((acc, value) => {
      if (typeof value === 'number')
        return {
          ...acc,
          [value]: false,
        };
      return acc;
    }, {})
  );
  const router = useRouter();
  const { id } = router.query;
  const stepTwoRef = useRef<any>(null);
  const { state } = useUserStore() as Context<Action>;

  useEffect(() => {
    if (id) {
      (async () => {
        const currentBundleResponse = await fetch(
          `/api/order/${id}?action=finish`
        );
        const currentBundleJson = await currentBundleResponse.json();
        if (currentBundleJson.data.status !== PlanStatus.PENDING) {
          await router.push('/error?error=OrderPaid_Finish');
        }
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

  useEffect(() => {
    if (router.query.step && state.user.id) {
      Object.entries(Steps).forEach(([stepOfSteps, stepNumber]) => {
        if (
          Number.isNaN(Number(stepOfSteps)) &&
          !Number.isNaN(Number(stepNumber)) &&
          Number(stepNumber) <= Steps[router.query.step as keyof typeof Steps]
        ) {
          stepSeen.current[Steps[stepOfSteps as keyof typeof Steps]] = true;
        }
      });
      setStep(
        parseInt(
          (Steps[
            router.query.step as keyof typeof Steps
          ] as unknown) as keyof typeof Steps,
          10
        )
      );
    }
  }, [state]);

  const StepOneShowWhenClosed = ({
    currentPlan,
  }: {
    currentPlan: Prisma.PlanGetPayload<{
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
  }) => {
    if (!currentPlan) return null;

    return (
      <Row className="mt-4 text-center">
        <Col>
          <strong>מדינה:</strong>&nbsp;
          <span className={styles.data}>
            {currentPlan.country?.translation}
          </span>
        </Col>
        <Col>
          <strong>נפח:</strong>&nbsp;
          <span className={styles.data}>
            {Math.floor((currentPlan.refill?.amount_mb || 0) / 1024)} ג&quot;ב
          </span>
        </Col>
        <Col>
          <strong>ימים:</strong>&nbsp;
          <span
            className={`${styles.data}${
              currentPlan.refill?.amount_days ? '' : ` ${styles.infinitySign}`
            }`}
          >
            {currentPlan.refill?.amount_days ?? (
              <FontAwesomeIcon icon={solid('infinity')} />
            )}
          </span>
        </Col>
        <Col>
          <strong>לתשלום:</strong>&nbsp;
          <span className={styles.data}>
            {'\u20AA'}
            {currentPlan.price}
          </span>
        </Col>
      </Row>
    );
  };

  const handleUserUpdate = async (data: FieldValues) => {
    try {
      const updatedUser = await fetch(
        `/api/user/${plan?.userId}?action=finish`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      const updatedUserJson = await updatedUser.json();
      if (updatedUserJson.success) {
        const updatedPlan = await fetch(`/api/order/${id}?action=finish`);
        const updatedPlanJson = await updatedPlan.json();
        setPlan(updatedPlanJson.data);
        toast.success(<ToastContent content={'הפרטים עודכנו בהצלחה'} />);
      }
    } catch (e) {
      console.error(e);
      await router.push('/error?error=Order');
    }
  };

  return (
    <MainLayout title="הזמנה" hideJumbotron showExitIntent>
      <div className={styles.main}>
        <Container className={styles.container}>
          <Section
            title="פרטי החבילה"
            open={step === 0}
            onClickHandler={() => {
              if (step > 0 || stepSeen.current[Steps.BUNDLE]) {
                setStep(0);
                setNextButtonDisabled(false);
              }
            }}
            showWhenClosed={
              plan ? (
                <StepOneShowWhenClosed currentPlan={plan} />
              ) : (
                <div className="text-center">
                  <Spinner animation={'border'} />
                </div>
              )
            }
            clickable={step > 0 || stepSeen.current[Steps.BUNDLE]}
          >
            <StepOne plan={plan} countries={countries} />
          </Section>
          <Section
            title="פרטים אישיים"
            open={step === 1}
            onClickHandler={() => {
              if (step > 1 || stepSeen.current[Steps.PERSONAL_DETAILS]) {
                setStep(1);
                setNextButtonDisabled(false);
              }
            }}
            clickable={step > 1 || stepSeen.current[Steps.PERSONAL_DETAILS]}
          >
            <StepTwo
              handleValid={async (data) => {
                try {
                  setLoading(true);
                  await handleUserUpdate(data);
                } catch (e) {
                  console.error(e);
                  await router.push('/error?error=Order');
                } finally {
                  setLoading(false);
                }
              }}
              setUserEdit={(edit) => setNextButtonDisabled(edit)}
              ref={stepTwoRef}
              user={plan?.user ?? null}
            />
          </Section>
          <Section
            title="תשלום"
            open={step === 2}
            onClickHandler={() => {
              if (step > 2 || stepSeen.current[Steps.PAYMENT]) {
                setStep(2);
                setNextButtonDisabled(false);
              }
            }}
            clickable={false}
          >
            <StepThree orderId={plan?.id} />
          </Section>
          <motion.div layout="position">
            {step < 2 && (
              <Button
                variant="primary"
                onClick={async () => {
                  if (step === 1 && !state.user.id) {
                    if (stepTwoRef.current) {
                      stepTwoRef.current.setStepLoading(true);
                    }
                    setLoading(true);
                    await router.push(
                      `${process.env.NEXT_PUBLIC_BASE_URL}/login?phone=${
                        plan?.user.email
                      }&orderId=${encodeURI(
                        plan?.id ?? ''
                      )}&callbackurl=${encodeURI(
                        `${process.env.NEXT_PUBLIC_BASE_URL}/order/finish/${plan?.id}?step=PAYMENT`
                      )}`
                    );
                  } else {
                    stepSeen.current[step] = true;
                    setStep(step + 1);
                  }
                }}
                className={styles.button}
                disabled={loading || nextButtonDisabled}
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
            )}
          </motion.div>
        </Container>
      </div>
    </MainLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken },
  };
}

export default Id;
