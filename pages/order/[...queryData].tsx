import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import styles from '../../styles/Transfer.module.scss';

const Transfer = () => {
  const router = useRouter();
  const id = router.query.queryData?.[0];

  useEffect(() => {
    if (id && window.top) {
      window.top.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/order/complete/${id}`;
    } else if (window.top) {
      window.top.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/error?error=Order`;
    }
  }, [id]);

  return (
    <div className={styles.main}>
      <Spinner animation="border" role="status" style={{ color: '#000' }} />
    </div>
  );
};

export default Transfer;
