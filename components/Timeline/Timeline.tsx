import React from 'react';
import styles from './Timeline.module.scss';

const Timeline = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <div
    className={`w-100 h-100 d-flex justify-content-between align-items-center ${styles.main}`}
  >
    {children}
  </div>
);

export default Timeline;
