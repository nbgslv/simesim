import React, {ChangeEvent, ForwardedRef, forwardRef} from 'react';
import {AnimatePresence, motion} from "framer-motion";
import styles from "./Input.module.scss";
import Image from "next/image";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import {FieldError, FieldErrorsImpl, Merge} from "react-hook-form";

type InputProps = {
    focusedBorderColor?: string,
    placeholder?: string,
    value?: string,
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void,
    autocomplete?: string
    validating?: boolean,
    error?: FieldError | Merge<FieldError, FieldErrorsImpl<any>>
}

const InputInner = ({
                        focusedBorderColor,
                        placeholder,
                        value,
                        onChange,
                        validating,
                        error,
                        ...props
}: InputProps, ref?: ForwardedRef<any>) => {
    return (
        <div className={styles.inputWrapper}>
            <motion.input
                {...props}
                whileFocus={{ borderColor: focusedBorderColor }}
                ref={ref}
                placeholder={placeholder}
                className={styles.input}
                type="text"
                value={value}
                onChange={onChange}
            />
            {validating && (
                <div>
                    <Image src={'/rings.svg'} width={20} height={20} />
                </div>
            )}
            {error && (
                <AnimatePresence>
                    <motion.div key={0} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className={styles.errorIcon}>
                        <FontAwesomeIcon icon={solid('exclamation')} />
                    </motion.div>
                    <motion.div key={1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.errorMessage}>
                        {error.message as string}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>

    );
};

const Input = forwardRef(InputInner);

export default Input;
