import React, { useEffect } from 'react';
import MainLayout from '../components/Layouts/MainLayout';
import { Alert, Container } from 'react-bootstrap';
import { useRouter } from 'next/router';
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
      } else {
        setAlertVariant('danger');
        setAlertMessage('אירעה שגיאה, נסה שנית');
      }
    }
  }, [router.query]);

  return (
    <MainLayout hideJumbotron>
      <Container className={styles.container}>
        <Alert variant={alertVariant}>{alertMessage}</Alert>
      </Container>
    </MainLayout>
  );
};

export default Error;
