import React, { useEffect } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { getCsrfToken, signIn, useSession } from 'next-auth/react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { NextPageContext } from 'next';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import Link from 'next/link';
import styles from '../styles/login.module.scss';
import MainLayout from '../components/Layouts/MainLayout';

const Login = ({ csrfToken }: { csrfToken: string | undefined }) => {
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');
  const [pageLoading, setPageLoading] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [callbackUrl, setCallbackUrl] = React.useState<string>('');
  const [alertVariant, setAlertVariant] = React.useState<string>('');
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
  const [_, setCookie] = useCookies(['phoneNumber', 'simesim_callbackUrl']);
  const { status } = useSession();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      if (phoneNumber.length === 10) {
        setLoading(true);
        setCookie('phoneNumber', phoneNumber);
        setCookie(
          'simesim_callbackUrl',
          callbackUrl || process.env.NEXT_PUBLIC_BASE_URL
        );
        if (!executeRecaptcha) {
          throw new Error('Recaptcha not loaded');
        }
        const token = await executeRecaptcha('login');
        await signIn('email', {
          email: phoneNumber,
          callbackUrl: callbackUrl || process.env.NEXT_PUBLIC_BASE_URL,
          recaptchaToken: token,
        });
      }
    } catch (error) {
      console.error(error);
      await router.push('/login?error=Default');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.error) {
      if (router.query.error === 'EmailCreateAccount') {
        setAlertVariant('danger');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      } else if (router.query.error === 'EmailSignin') {
        setAlertVariant('danger');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      } else if (router.query.error === 'SessionRequired') {
        setAlertVariant('danger');
        setAlertMessage('כדי לצפות בתוכן זה עלייך להתחבר תחילה');
      } else if (router.query.error === 'Default') {
        setAlertVariant('danger');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      } else {
        setAlertVariant('danger');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      }
    } else if (router.query.phone && router.query.orderId) {
      setCallbackUrl(
        `${process.env.NEXT_PUBLIC_BASE_URL}/order/payment?orderId=${router.query.orderId}`
      );
      setPhoneNumber(router.query.phone as string);
    } else if (router.query.phone && router.query.changeDetailsId) {
      setCallbackUrl(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user/changeDetails?changeDetailsId=${router.query.changeDetailsId}`
      );
      setPhoneNumber(router.query.phone as string);
    }
    setPageLoading(false);
  }, [router.query, executeRecaptcha]);

  if (status === 'loading' || pageLoading)
    return (
      <MainLayout title="טוען..." hideJumbotron>
        <div
          className={`${styles.signIn} w-100 d-flex justify-content-center align-items-center`}
        >
          <Spinner animation="border" role="status" />
        </div>
      </MainLayout>
    );

  if (status === 'authenticated') {
    router.push('/');
  }

  if (status === 'unauthenticated')
    return (
      <MainLayout
        title="התחברות"
        metaCanonical={`${process.env.NEXT_PUBLIC_BASE_URL}/login`}
        hideJumbotron
      >
        <div className={styles.main}>
          <h1 className="text-center p-2">התחברות</h1>
          <Form
            className={`${styles.signIn} d-flex flex-column align-items-center justify-content-center`}
          >
            {router.query.phone && router.query.orderId && (
              <Alert className="text-center" variant="info">
                לפני שנמשיך, וכדי לוודא שאתם לא רובוטים,
                <br /> נשלח לטלפון שתזינו הודעה עם קוד, אותו תתבקשו להזין במסך
                הבא
              </Alert>
            )}
            {router.query.phone && router.query.changeDetailsId && (
              <Alert className="text-center" variant="info">
                על-מנת לעדכן את פרטי החשבון, עלינו לאמת את זהותך.
                <br />
                נשלח לטלפון שתזינו הודעה עם קוד, אותו תתבקשו להזין במסך הבא
                <br />
                <br />
                <div className="text-muted small">
                  חשוב: אם עדכנת את מספר הטלפון, חשוב להזין את מספר הטלפון הקודם
                  <br />
                  אם אינך מחזיק עוד במספר הקודם, ניתן{' '}
                  <Link href={'/contact'}>ליצור עימנו קשר</Link> ונסייע לעדכן את
                  חשבונך
                </div>
              </Alert>
            )}
            {alertVariant && (
              <Alert variant={alertVariant}>{alertMessage}</Alert>
            )}
            <Form.Control type="hidden" name="csrfToken" value={csrfToken} />
            <Form.Group className={styles.formGroup}>
              <Form.Label>טלפון נייד</Form.Label>
              <Form.Control
                dir="ltr"
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={styles.buttonColor}
                type="text"
                name="email"
                id="email"
                size="lg"
                autoFocus
              />
            </Form.Group>
            <motion.div layout>
              <Button
                disabled={loading}
                className={styles.button}
                variant="primary"
                type="submit"
                onClick={() => handleLogin()}
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
          </Form>
        </div>
      </MainLayout>
    );

  return null;
};

export async function getServerSideProps(context: NextPageContext) {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken },
  };
}

export default Login;
