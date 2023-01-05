import React, { ChangeEvent, ForwardedRef, forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
} from 'react-hook-form';
import styles from './Input.module.scss';

type InputProps<T extends FieldValues> = {
  focusedBorderColor?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  autocomplete?: string;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<T>> | string;
  readonly?: boolean;
  cancelButton?: boolean;
  handleCancel?: () => void;
  ariaLabeledby?: string;
};

const InputInner = <T extends FieldValues>(
  {
    focusedBorderColor,
    placeholder,
    value,
    onChange,
    error,
    readonly,
    cancelButton,
    handleCancel,
    ariaLabeledby,
    ...props
  }: InputProps<T>,
  ref?: ForwardedRef<any>
) => (
  <div className={styles.inputWrapper}>
    <motion.input
      {...props}
      readOnly={readonly}
      whileFocus={{ borderColor: focusedBorderColor }}
      ref={ref}
      placeholder={placeholder}
      className={styles.input}
      type="text"
      value={value}
      onChange={onChange}
      aria-labelledby={ariaLabeledby}
      aria-autocomplete="list"
      aria-controls="autocomplete-list"
      aria-expanded="true"
      role="combobox"
      data-clarity-unmask="true"
    />
    <div className={`d-flex position-absolute ${styles.inputEnd}`}>
      {cancelButton && (
        <motion.button
          whileHover={{
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
          }}
          whileTap={{
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
          }}
          onClick={() => handleCancel && handleCancel()}
        >
          <FontAwesomeIcon icon={solid('x')} style={{ color: '#000' }} />
        </motion.button>
      )}
      {error && (
        <AnimatePresence>
          <motion.div
            key={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.errorMessage}
          >
            {typeof error === 'string'
              ? (error as string)
              : (error.message as string)}
          </motion.div>
          <motion.div
            key={1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={styles.errorIcon}
          >
            <FontAwesomeIcon icon={solid('exclamation')} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  </div>
);

const Input = forwardRef(InputInner);

export default Input;
