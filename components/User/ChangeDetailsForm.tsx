import React, { useEffect } from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { User } from '@prisma/client';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { signOut } from 'next-auth/react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/router';
import styles from './ChangeDetailsForm.module.scss';

const schema = yup.object().shape({
  firstName: yup.string().required('שדה חובה'),
  lastName: yup.string().required('שדה חובה'),
  emailEmail: yup.string().email('דוא"ל לא תקין').required('שדה חובה'),
  email: yup.string().length(10, 'טלפון לא תקין').required('שדה חובה'),
});
const ChangeDetailsForm = ({ user }: { user: Partial<User> }) => {
  const [pageLoading, setPageLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(['changeDetails']);
  const router = useRouter();
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
    (async () => {
      if (
        cookies.changeDetails &&
        router.query.action &&
        router.query.action === 'updateDetails'
      ) {
        const updatedUser = await fetch(
          `/api/user/${cookies.changeDetails.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cookies.changeDetails),
          }
        );
        if (updatedUser.status === 200) {
          removeCookie('changeDetails');
          await router.replace(`/user/changeDetails?success=true`);
        }
      } else {
        if (user) {
          reset(user);
        }
        setPageLoading(false);
      }
    })();
  }, [cookies.changeDetails, user, router.query]);

  const updateDetails = async (data: Partial<User>) => {
    setLoading(true);
    setCookie('changeDetails', JSON.stringify({ id: user.id, ...data }));
    await signOut({
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login?phone=${data.email}&action=updateDetails`,
    });
  };

  if (pageLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Form className={styles.main}>
      <Form.Group as={Row}>
        <Form.Label column sm="3">
          שם פרטי
        </Form.Label>
        <Col>
          <Form.Control
            {...register('firstName')}
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
        <Form.Label column sm="3">
          שם משפחה
        </Form.Label>
        <Col>
          <Form.Control
            {...register('lastName')}
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
        <Form.Label column sm="3">
          טלפון
        </Form.Label>
        <Col>
          <Form.Control
            {...register('email')}
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
        <Form.Label column sm="3">
          דוא&quot;ל
        </Form.Label>
        <Col>
          <Form.Control
            {...register('emailEmail')}
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
                <Spinner animation="border" size="sm" />
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