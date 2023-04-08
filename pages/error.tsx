import React, { useEffect } from 'react';
import { Alert, Button, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';
import MainLayout from '../components/Layouts/MainLayout';
import styles from '../styles/error.module.scss';

const Error = () => {
  const [alertVariant, setAlertVariant] = React.useState<string>('');
  const [alertMessage, setAlertMessage] = React.useState<string>('');
  const router = useRouter();

  useEffect(() => {
    if (router.query.error) {
      if (router.query.error === 'Configuration') {
        setAlertVariant('warning');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      } else if (router.query.error === 'AccessDenied') {
        setAlertVariant('danger');
        setAlertMessage('כדי לצפות בעמוד זה עלייך להרשם תחילה');
      } else if (router.query.error === 'Verification') {
        setAlertVariant('danger');
        setAlertMessage('קוד האימות שהזנת שגוי, נסה שנית');
      } else if (router.query.error === 'Order') {
        setAlertVariant('danger');
        setAlertMessage('משהו השתבש עם קליטת ההזמנה. מציעים לבדוק עם התמיכה.');
      } else if (router.query.error === 'OrderPaid_Finish') {
        setAlertVariant('danger');
        setAlertMessage('ההזמנה הסתיימה.');
      } else if (router.query.error === 'Payment') {
        setAlertVariant('danger');
        setAlertMessage(
          'משהו קרה לשירות התשלומים שלנו. מציעים לבדוק שוב בעוד זמן קצר.'
        );
      } else if (router.query.error === 'Unsubscribe') {
        setAlertVariant('danger');
        setAlertMessage(
          'התרחשה שגיאה בעת ניסיון ההסרה מרשימת התפוצה. אנו מתנצלים, אנא נסו שוב מאוחר יותר.'
        );
      } else {
        setAlertVariant('danger');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      }
    }
  }, [router.query]);

  return (
    <MainLayout title="התרחשה שגיאה" hideJumbotron>
      <Container className={styles.container}>
        <Alert variant={alertVariant}>{alertMessage}</Alert>
        <Button variant="primary" href="/">
          חזרה לדף הבית
        </Button>
      </Container>
    </MainLayout>
  );
};

export default Error;
