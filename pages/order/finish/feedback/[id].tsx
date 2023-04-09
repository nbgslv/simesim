import React, { useRef } from 'react';
import { Button, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { toast } from 'react-toastify';
import MainLayout from '../../../../components/Layouts/MainLayout';
import styles from '../../../../styles/feedbackFinish.module.scss';
import ToastContent from '../../../../components/Toast/ToastContent';

const Id = () => {
  const couponCodeRef = useRef<HTMLSpanElement>(null);

  const handleCouponCodeCopy = () => {
    if (couponCodeRef.current) {
      // Copy the text inside the text field
      navigator.clipboard.writeText(couponCodeRef.current.innerText);

      toast.success(<ToastContent content={'הקוד הועתק בהצלחה'} />);
    }
  };

  return (
    <MainLayout title="תודה על המשוב" hideJumbotron>
      <div className={styles.main}>
        <Container>
          <div className="mt-2">
            <h1>תודה על המשוב</h1>
            <div className="mt-4 mb-4">
              כאות תודה, נשמח להעניק לך קופון מיוחד המעניק 20% הנחה לרכישה הבאה.
              כל שיש לעשות הוא לשמור את קוד הקופון ולהפעילו ברכישתך הבאה.
            </div>
            <div className={styles.coupon}>
              <h3>קוד הקופון שלך הוא:</h3>
              <h2>
                <Button
                  onClick={handleCouponCodeCopy}
                  className={styles.copyButton}
                >
                  <FontAwesomeIcon icon={regular('copy')} />
                </Button>{' '}
                <span ref={couponCodeRef}>POST2023</span>
              </h2>
            </div>
          </div>
        </Container>
      </div>
    </MainLayout>
  );
};

export default Id;
