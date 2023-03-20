import React, { useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useCookies } from 'react-cookie';
import styles from './IdleIntentModal.module.scss';
import Close from '../../public/close.svg';

const IdleIntentModal = ({
  show,
  hide,
}: {
  show: boolean;
  hide: () => void;
}) => {
  const [showModal, setShowModal] = React.useState(show);
  // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-unused-vars
  const [_, setCookie] = useCookies(['exitModalSeen']);

  useEffect(() => {
    if (show) {
      const expiryDate = new Date(Date.now() + 14 * (1000 * 60 * 60 * 24));
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      setCookie('exitModalSeen', true, { expires: expiryDate });
    }
    setShowModal(show);
  }, [show]);

  return (
    <Modal
      show={showModal}
      onHide={() => setShowModal(false)}
      className={styles.main}
    >
      <Button onClick={() => hide()} className={styles.closeButton}>
        <Close />
      </Button>
      <Modal.Body className={styles.body}>
        <h1 className="text-center mb-4">אל תחכו שיגמר...</h1>
        <div>
          <div className={styles.row}>
            <div className={styles.number}>1</div>
            <div className={styles.text}>
              הכרטיס לא עבד? לא נורא, קבלו החזר כספי
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.number}>2</div>
            <div className={styles.text}>
              חיסכון ממוצע של {'\u20AA'}100 לעומת חבילות סלולר רגילות
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.number}>3</div>
            <div className={styles.text}>תמיכה אנושית מלאה מסביב לשעון</div>
          </div>
          <div className={styles.row}>
            <div className={styles.number}>4</div>
            <div className={styles.text}>
              ממש פשוט: סורקים, מתקינים ומשתמשים
            </div>
          </div>
        </div>
        <div className="mt-4 w-100 d-flex justify-content-center align-items-center">
          <Button
            href="/?coupon=NEW20"
            size="lg"
            variant="primary"
            className={styles.button}
          >
            להנחה של 20%
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default IdleIntentModal;
