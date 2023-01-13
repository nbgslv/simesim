import React from 'react';
import { motion } from 'framer-motion';
import styles from './BundleCard.module.scss';

const BundleCard = ({
  text,
  value,
  selected,
  onSelect,
  disabled,
}: {
  text: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  disabled: boolean;
}) => (
  <motion.button
    whileHover={
      !disabled
        ? {
            scale: 1.1,
            boxShadow: '0px 3px 15px 5px rgba(0,0,0,0.25)',
          }
        : {}
    }
    className={`${styles.bundleCardContainer}${
      selected ? ` ${styles.selected}` : ''
    }`}
    onClick={() => onSelect(value)}
    disabled={disabled}
  >
    <div>
      <div>{text}</div>
    </div>
  </motion.button>
);

export default BundleCard;
