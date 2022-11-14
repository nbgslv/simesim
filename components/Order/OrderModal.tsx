import React from 'react';
import {Button, Col, Modal, Row, Form} from "react-bootstrap";
import DatePicker, {registerLocale} from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import Input from "../Input/Input";
import {Bundle, Refill} from "../../utils/api/sevices/keepGo/types";
import styles from './OrderModal.module.scss';
import "react-datepicker/dist/react-datepicker.css";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {AnimatePresence, motion} from "framer-motion";
import he from "date-fns/locale/he";

type BundlesSectionProps = {
    show: boolean,
    onHide: () => void,
    bundle?: Bundle,
    refill?: Refill | null,
    country?: string,
}

const schema = yup.object().shape({
    startDate: yup.date().min(new Date(), 'תאריך לא תקין').required('שדה חובה').nullable(true),
    endDate: yup.date().min(yup.ref('startDate'), 'תאריך לא תקין').required('שדה חובה').nullable(true),
    firstName: yup.string().required('שדה חובה'),
    lastName: yup.string().required('שדה חובה'),
    email: yup.string().email('דוא"ל לא תקין').required('שדה חובה'),
    phone: yup.string().length(10, 'טלפון לא תקין').required('שדה חובה'),
    terms: yup.boolean().oneOf([true]).required('שדה חובה'),
})

const OrderModal = ({ show, onHide, bundle, refill, country }: BundlesSectionProps) => {
    registerLocale('he', he);
    const { getValues, control, handleSubmit, formState: { errors, isValidating } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        resolver: yupResolver(schema),
        defaultValues: {
            startDate: null,
            endDate: null,
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            terms: false,
        }
    });

    return (
        <Modal
            show={show}
            onHide={onHide}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className={styles.main}
        >
            <form onSubmit={handleSubmit((data) => console.log(data))}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        הזמינו חבילת eSim
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                        <Row className={styles.orderModalRow}>
                            <Col className={styles.omFieldTitle} lg={3}>
                                פרטי החבילה
                            </Col>
                            <Col className="d-flex">
                                <div className={styles.bundleText}>
                                    {bundle?.name} -
                                </div>
                                <div className={styles.bundleText}>
                                    {refill?.title}
                                </div>
                                <div className={styles.bundleText}>
                                    {refill ? refill.price_usd + 1.2 : ''}$
                                </div>
                            </Col>
                        </Row>
                        <Row className={styles.orderModalRow}>
                            <Col className={styles.omFieldTitle} lg={3}>
                                לאן טסים
                            </Col>
                            <Col className={styles.countryText}>
                                {country}
                            </Col>
                        </Row>
                        <Row className={styles.orderModalRow}>
                            <Col className={styles.omFieldTitle} lg={3}>
                                תאריכי נסיעה
                            </Col>
                            <Col className={styles.dateInput}>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) =>
                                        <DatePicker
                                            selected={field.value}
                                            onChange={field.onChange}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="מתאריך"
                                            minDate={new Date()}
                                            openToDate={new Date()}
                                            isClearable
                                            locale="he"
                                        />
                                    }
                                />
                                {errors.startDate && (
                                    <AnimatePresence>
                                        <motion.div key={1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.errorMessage}>
                                            {errors.startDate.message as string}
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </Col>
                            <Col className={styles.dateInput}>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) =>
                                        <DatePicker
                                            selected={field.value}
                                            onChange={field.onChange}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="עד תאריך"
                                            minDate={getValues('startDate')}
                                            openToDate={getValues('startDate') || undefined}
                                            isClearable
                                            disabled={!getValues('startDate')}
                                            locale="he"
                                        />
                                    }
                                />
                                {errors.endDate && (
                                    <AnimatePresence>
                                        <motion.div key={1} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.errorMessage}>
                                            {errors.endDate.message as string}
                                        </motion.div>
                                    </AnimatePresence>
                                )}
                            </Col>
                        </Row>
                        <Row className={styles.orderModalRow}>
                            <Col>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    rules={{ required: 'הזן שם פרטי' }}
                                    render={({ field, fieldState }) =>
                                        <Input
                                            {...field}
                                            placeholder="שם פרטי"
                                            autocomplete="given-name"
                                            focusedBorderColor="#FFC107"
                                            ref={field.ref}
                                            value={field.value}
                                            onChange={field.onChange}
                                            validating={isValidating}
                                            error={fieldState.error}
                                        />
                                    }
                                />
                            </Col>
                        </Row>
                        <Row className={styles.orderModalRow}>
                            <Col>
                                <Controller
                                    name="lastName"
                                    control={control}
                                    rules={{ required: 'הזן שם משפחה' }}
                                    render={({ field, fieldState }) =>
                                        <Input
                                            {...field}
                                            placeholder="שם משפחה"
                                            autocomplete="family-name"
                                            focusedBorderColor="#FFC107"
                                            ref={field.ref}
                                            value={field.value}
                                            onChange={field.onChange}
                                            validating={isValidating}
                                            error={fieldState.error}
                                        />
                                    }
                                />
                            </Col>
                        </Row>
                        <Row className={styles.orderModalRow}>
                            <Col>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{ required: 'הזו טלפון נייד' }}
                                    render={({ field, fieldState }) =>
                                        <Input
                                            {...field}
                                            placeholder="טלפון נייד"
                                            autocomplete="tel"
                                            focusedBorderColor="#FFC107"
                                            ref={field.ref}
                                            value={field.value}
                                            onChange={field.onChange}
                                            validating={isValidating}
                                            error={fieldState.error}
                                        />
                                    }
                                />
                                <small>מספר זה ישמש בעת התחברות לחשבונך</small>
                            </Col>
                        </Row>
                        <Row className={styles.orderModalRow}>
                            <Col>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{ required: 'הזן דוא"ל' }}
                                    render={({ field, fieldState }) =>
                                        <Input
                                            {...field}
                                            placeholder={'דוא"ל'}
                                            autocomplete="email"
                                            focusedBorderColor="#FFC107"
                                            ref={field.ref}
                                            value={field.value}
                                            onChange={field.onChange}
                                            validating={isValidating}
                                            error={fieldState.error}
                                        />
                                    }
                                />
                                <small>לכתובת דוא"ל זו ישלח קוד QR להפעלת הכרטיס</small>
                            </Col>
                        </Row>
                </Modal.Body>
                <Modal.Footer className="d-flex justify-content-between">
                    <div>
                        <Controller
                            name="terms"
                            control={control}
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <Form.Check type="checkbox" id="terms" reverse>
                                    <Form.Check.Input
                                        type="checkbox"
                                        isInvalid={fieldState.error !== undefined}
                                        checked={field.value}
                                        onChange={field.onChange}
                                    />
                                    <Form.Check.Label>אני מאשר/ת את&nbsp;
                                        <a href="/terms" target="_blank">תנאי השימוש</a>
                                    </Form.Check.Label>
                                </Form.Check>
                            )}
                        />
                    </div>
                    <div>
                        <Button type="submit" variant="primary" className={styles.submitButton}>לתשלום</Button>
                    </div>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default OrderModal;
