import React, {useEffect} from 'react';
import {Button, Col, Container, Modal, Row} from "react-bootstrap";
import DatePicker from "react-datepicker";
import { useForm, Controller } from "react-hook-form";
import Input from "../Input/Input";
import {Bundle, Refill} from "../../utils/api/sevices/keepGo/types";
import styles from './OrderModal.module.scss';
import "react-datepicker/dist/react-datepicker.css";

type BundlesSectionProps = {
    show: boolean,
    onHide: () => void,
    bundle?: Bundle,
    refill?: Refill | null,
    country?: string,
}

const OrderModal = ({ show, onHide, bundle, refill, country }: BundlesSectionProps) => {
    const { control, handleSubmit, formState: { errors, isValidating } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        defaultValues: {
            startDate: new Date(),
            endDate: new Date(),
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
        }
    });

    useEffect(() => {
        console.log({ errors })
    }, [errors])

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
                                        />
                                    }
                                />
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
                                        />
                                    }
                                />
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
                <Modal.Footer>
                    <Button type="submit" variant="primary" className={styles.submitButton}>לתשלום</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
};

export default OrderModal;
