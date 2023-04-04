import React from 'react';
import styles from './ToastContent.module.scss';

const ToastContent = ({ content }: { content: string }) => (
  <div className={styles.content}>{content}</div>
);

export default ToastContent;
