import React from 'react';
import { Button } from 'react-bootstrap';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/fourOFour.module.scss';

const FourOFour = () => (
  <div className={styles.main}>
    <div>
      <Image src="/logo.png" alt="" width="166" height="100" />
    </div>
    <div className={styles.title}>404</div>
    <div>
      <div className={styles.subTitle}>
        זה הרבה יותר מהמחיר שאנו מציעים לחבילה פשוטה
      </div>
      <div className="text-center">
        <Link passHref href="/#bundles-section" legacyBehavior>
          <Button variant="primary" size="lg">
            לחבילות שלנו
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default FourOFour;
