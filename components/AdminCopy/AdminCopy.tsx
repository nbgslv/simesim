import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './AdminCopy.module.scss';
import ToastContent from '../Toast/ToastContent';

const AdminCopy = ({ value }: { value: string }) => {
  const [showCopy, setShowCopy] = useState(false);

  const handleCouponCodeCopy = () => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(value);
    toast.success(
      <ToastContent
        content={`${value.substring(0, 10)}... was copied successfully`}
      />
    );
  };

  return (
    <div className={styles.main}>
      <Button
        onMouseEnter={() => setShowCopy(true)}
        onMouseLeave={() => setShowCopy(false)}
        onClick={handleCouponCodeCopy}
        className={styles.copyButton}
      >
        <span className="me-1">{value}</span>
        <AnimatePresence initial={false}>
          {showCopy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FontAwesomeIcon icon={regular('copy')} />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
};

export default AdminCopy;
