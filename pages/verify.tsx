import React, { useEffect } from 'react';
import { Alert, Button, Form, Nav, Spinner } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import OtpInput from 'react-otp-input';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Countdown, { zeroPad } from 'react-countdown';
import { getCsrfToken } from 'next-auth/react';
import { NextPageContext } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import styles from '../styles/verify.module.scss';
import MainLayout from '../components/Layouts/MainLayout';

const Verify = ({ csrfToken }: { csrfToken: string }) => {
  const TIMER = 60000; // 60 seconds
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');
  const [callbackUrl, setCallbackUrl] = React.useState<string>('');
  const [otp, setOtp] = React.useState<string>('');
  const [showOtp, setShowOtp] = React.useState<boolean>(true);
  const [alertVariant, setAlertVariant] = React.useState<string>('');
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const [allowResend, setAllowResend] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [timer, setTimer] = React.useState<number>(Date.now() + TIMER);
  const [resendLoading, setResendLoading] = React.useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
  const [cookies, _, removeCookie] = useCookies([
    'phoneNumber',
    'simesim_callbackUrl',
  ]);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();

  useEffect(() => {
    const cookiePhoneNumber = cookies.phoneNumber;
    const cookieCallbackUrl = cookies.simesim_callbackUrl;
    setPhoneNumber(cookiePhoneNumber);
    setCallbackUrl(cookieCallbackUrl || 'https://simesim.co.il');
    removeCookie('simesim_callbackUrl');
    if (cookiePhoneNumber) {
      removeCookie('phoneNumber');
      setAlertVariant('success');
      setAlertMessage(`קוד האימות נשלח בהצלחה לוואצאפ ${cookiePhoneNumber}`);
      setShowOtp(true);
    } else {
      setAlertVariant('danger');
      setAlertMessage('אירעה שגיאה, נסה שנית');
      setShowOtp(false);
    }
  }, []);

  const handleVerification = async () => {
    try {
      if (otp.length === 6 && phoneNumber) {
        setLoading(true);
        if (!executeRecaptcha) {
          throw new Error('Recaptcha not loaded');
        }
        const token = await executeRecaptcha('verify');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber,
              token: otp,
              callbackUrl,
              recaptchaToken: token,
            }),
            redirect: 'follow',
          }
        );
        if (res.redirected) {
          await router.push(res.url);
        }
        setLoading(false);
      } else if (!phoneNumber) {
        setAlertVariant('danger');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      setAlertVariant('danger');
      setAlertMessage('קוד האימות פג תוקף או שאינו נכון');
    }
  };

  const handleReLogin = async (method?: string) => {
    const params = {
      email: phoneNumber,
      method: method || 'whatsapp',
      csrfToken,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
      json: 'true',
    };

    let methodTranslation = 'לוואצאפ';
    if (method === 'sms') {
      methodTranslation = 'באמצעות מסרון לטלפון';
    } else if (method === 'voice') {
      methodTranslation = 'באמצעות שיחה טלפונית לטלפון';
    }

    setResendLoading(true);
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/signin/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(Object.entries(params)).toString(),
    });
    setResendLoading(false);
    setAlertVariant('success');
    setAlertMessage(
      `קוד האימות נשלח בהצלחה ${methodTranslation} ${phoneNumber}`
    );
    setTimer(Date.now() + TIMER);
    setAllowResend(false);
  };

  return (
    <MainLayout hideJumbotron>
      <Form
        className={`${styles.signIn} d-flex flex-column align-items-center justify-content-center`}
      >
        {alertVariant && <Alert variant={alertVariant}>{alertMessage}</Alert>}
        {showOtp && (
          <>
            <Form.Group className={styles.formGroup}>
              <Form.Label>קוד האימות</Form.Label>
              <div dir="ltr">
                <OtpInput
                  value={otp}
                  onChange={(value: string) => setOtp(value)}
                  numInputs={6}
                  isInputNum
                  shouldAutoFocus
                  containerStyle={styles.otpInputContainer}
                  inputStyle={styles.otpInput}
                />
              </div>
            </Form.Group>
            <motion.div layout>
              <Button
                disabled={loading}
                className={styles.button}
                variant="primary"
                onClick={() => handleVerification()}
              >
                {loading ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    style={{ color: '#ffffff' }}
                  />
                ) : (
                  'כניסה'
                )}
              </Button>
            </motion.div>
          </>
        )}
        <Alert variant="info" className={styles.alert}>
          {resendLoading ? (
            <Spinner
              as="span"
              animation="border"
              role="status"
              aria-hidden="true"
            />
          ) : (
            <>
              {allowResend ? (
                <>
                  שלחו לי קוד אימות חדש
                  <Nav className="d-flex flex-column">
                    <Nav.Link onClick={() => handleReLogin('sms')}>
                      <FontAwesomeIcon icon={solid('caret-left')} /> באמצעות
                      מסרון(הודעת SMS)
                    </Nav.Link>
                    <Nav.Link onClick={() => handleReLogin('whatsapp')}>
                      <FontAwesomeIcon icon={solid('caret-left')} /> או באמצעות
                      וואצאפ
                    </Nav.Link>
                    <Nav.Link onClick={() => handleReLogin('voice')}>
                      <FontAwesomeIcon icon={solid('caret-left')} /> או באמצעות
                      שיחה קולית
                    </Nav.Link>
                  </Nav>
                </>
              ) : (
                <>
                  לא קיבלת קוד? ניתן יהיה לנסות שוב בעוד&nbsp;
                  <Countdown
                    date={timer}
                    autoStart
                    renderer={({ minutes, seconds }) =>
                      `${zeroPad(minutes, 2)}:${zeroPad(seconds, 2)}`
                    }
                    onComplete={() => setAllowResend(true)}
                  />
                </>
              )}
            </>
          )}
        </Alert>
      </Form>
    </MainLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken },
  };
}

export default Verify;
