import React, { useEffect } from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { User } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { signOut } from 'next-auth/react';
import styles from './ChangeDetailsForm.module.scss';

const schema = yup.object().shape({
  firstName: yup.string().required('שדה חובה'),
  lastName: yup.string().required('שדה חובה'),
  emailEmail: yup.string().email('דוא"ל לא תקין').required('שדה חובה'),
  email: yup.string().length(10, 'טלפון לא תקין').required('שדה חובה'),
});
const ChangeDetailsForm = ({ user }: { user: Partial<User> }) => {
  const [loading, setLoading] = React.useState(false);
  const {
    register,
    reset,
    formState: { errors },
    handleSubmit,
  } = useForm<Partial<User>>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      emailEmail: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset(user);
    }
  }, [user]);

  const updateDetails = async (data: Partial<User>) => {
    setLoading(true);
    const changeDetailsData = await fetch(`/api/user/${user.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const changeDetailsDataJson = await changeDetailsData.json();
    if (changeDetailsDataJson.success) {
      Sentry.setUser(null);
      await signOut({
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login?phone=${data.email}&changeDetailsId=${changeDetailsDataJson.data.id}`,
      });
    }
  };

  return (
    <Form className={styles.main}>
      <Form.Group as={Row}>
        <Form.Label column id="first-name-label" for="first-name" sm="3">
          שם פרטי
        </Form.Label>
        <Col>
          <Form.Control
            {...register('firstName')}
            id="first-name"
            aria-label="first name"
            type="text"
            placeholder="שם פרטי"
            isInvalid={!!errors.firstName}
          />
          <Form.Control.Feedback type="invalid">
            {errors.firstName?.message}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mt-2">
        <Form.Label column id="last-name-label" for="last-name" sm="3">
          שם משפחה
        </Form.Label>
        <Col>
          <Form.Control
            {...register('lastName')}
            id="last-name"
            aria-label="last name"
            type="text"
            placeholder="שם משפחה"
            isInvalid={!!errors.lastName}
          />
          <Form.Control.Feedback type="invalid">
            {errors.firstName?.message}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mt-2">
        <Form.Label column id="phone-label" for="phone" sm="3">
          טלפון
        </Form.Label>
        <Col>
          <Form.Control
            {...register('email')}
            id="phone"
            aria-label="email"
            type="text"
            placeholder="טלפון"
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email?.message}
          </Form.Control.Feedback>
        </Col>
      </Form.Group>
      <Form.Group as={Row} className="mt-2">
        <Form.Label column id="email-label" for="email" sm="3">
          דוא&quot;ל
        </Form.Label>
        <Col>
          <Form.Control
            {...register('emailEmail')}
            id="email"
            aria-labelledby="email-label"
            aria-label="email"
            type="text"
            placeholder={'דוא"ל'}
            isInvalid={!!errors.emailEmail}
          />
          <Form.Control.Feedback type="invalid">
            {errors.emailEmail?.message}
          </Form.Control.Feedback>
        </Col>
        <Row>
          <Col className="d-flex justify-content-center">
            <Button
              onClick={handleSubmit((data) => updateDetails(data))}
              className={`${styles.button} mt-3`}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  style={{ color: '#fff' }}
                />
              ) : (
                'עדכון פרטים'
              )}
            </Button>
          </Col>
        </Row>
      </Form.Group>
    </Form>
  );
};

export default ChangeDetailsForm;
