import React, { ChangeEvent, ForwardedRef, forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Input.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

type InputProps = {
  focusedBorderColor?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  autocomplete?: string;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | string;
  readonly?: boolean;
  cancelButton?: boolean;
  handleCancel?: () => void;
};

const InputInner = (
  {
    focusedBorderColor,
    placeholder,
    value,
    onChange,
    error,
    readonly,
    cancelButton,
    handleCancel,
    ...props
  }: InputProps,
  ref?: ForwardedRef<any>
) => {
  return (
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
            <FontAwesomeIcon icon={solid('x')} />
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
              {error.message ? (error.message as string) : (error as string)}
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
};

const Input = forwardRef(InputInner);

export default Input;
