import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { User } from '@prisma/client';
import { Col, Container, Row } from 'react-bootstrap';
import Link from 'next/link';
import { Controller, FieldErrors, FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../Input/Input';
import styles from '../Order/OrderModal.module.scss';

const schema = yup.object().shape({
  firstName: yup.string().required('שדה חובה'),
  lastName: yup.string().required('שדה חובה'),
  email: yup.string().email('דוא"ל לא תקין').required('שדה חובה'),
  phoneNumber: yup.string().length(10, 'טלפון לא תקין').required('שדה חובה'),
});

const StepTwo = forwardRef(
  (
    {
      user,
      handleValid,
      handleErrors,
    }: {
      user: User | null;
      handleValid: (data: FieldValues) => Promise<void>;
      handleErrors: (errors: FieldErrors<FieldValues>) => Promise<void>;
    },
    ref
  ) => {
    const { control, handleSubmit, reset, formState } = useForm({
      mode: 'onBlur',
      reValidateMode: 'onChange',
      resolver: yupResolver(schema),
      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        terms: false,
      },
    });

    useImperativeHandle(ref, () => ({
      handleSubmit: () =>
        handleSubmit(
          async (data) => {
            await handleValid(data);
          },
          async (errors) => {
            await handleErrors(errors);
          }
        ),
    }));

    useEffect(() => {
      reset({
        firstName: user?.firstName ?? undefined,
        lastName: user?.lastName ?? undefined,
        email: user?.emailEmail ?? undefined,
        phoneNumber: user?.email ?? undefined,
      });
    }, [user]);

    return (
      <Container>
        <form>
          {user?.id && (
            <Row className={styles.orderModalRow}>
              <small>
                <strong>
                  נא לוודא שפרטיך נכונים.{' '}
                  <Link href="/user/changeDetails">לעדכון הפרטים</Link>
                </strong>
              </small>
            </Row>
          )}
          <Row className={styles.orderModalRow}>
            <Col>
              <Controller
                name="firstName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="שם פרטי"
                    aria-placeholder="first name"
                    aria-label="first name"
                    autocomplete="given-name"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    readonly={!!user?.id}
                    error={fieldState.error}
                  />
                )}
              />
            </Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col>
              <Controller
                name="lastName"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="שם משפחה"
                    autocomplete="family-name"
                    aria-placeholder="last name"
                    aria-label="last name"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    readonly={!!user?.id}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
            </Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col>
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="טלפון נייד"
                    autocomplete="tel"
                    aria-placeholder="mobile phone"
                    aria-label="mobile phone"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    readonly={!!user?.id}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              {!user?.id && <small>מספר זה ישמש בעת התחברות לחשבונך</small>}
            </Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder={'דוא"ל'}
                    autocomplete="email"
                    aria-placeholder="email"
                    aria-label="email"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    readonly={!!user?.id}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              {!user?.id && (
                <small>לכתובת דוא&quot;ל זו ישלח קוד QR להפעלת הכרטיס</small>
              )}
            </Col>
          </Row>
        </form>
      </Container>
    );
  }
);

StepTwo.displayName = 'StepTwo';

export default StepTwo;
