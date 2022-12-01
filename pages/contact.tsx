import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  brands,
  regular,
} from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Nav,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AnimatePresence, motion } from 'framer-motion';
import text from '../lib/content/text.json';
import styles from '../styles/contact.module.scss';
import MainLayout from '../components/Layouts/MainLayout';
import Input from '../components/Input/Input';

const schema = yup.object().shape({
  name: yup.string(),
  phone: yup.string().test('phone-optional', 'שדה חובה', (phone) => {
    if (phone) {
      return phone.length === 10;
    }
    return true;
  }),
  email: yup.string().email('דוא"ל לא תקין').required('שדה חובה'),
  message: yup.string().required('שדה חובה'),
});

const Contact = () => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
    },
  });

  const submitForm = async (data: any) => {
    try {
      setLoading(true);
      if (!executeRecaptcha) {
        throw new Error('Recaptcha not loaded');
      }
      const token = await executeRecaptcha('contact');
      const newInquiry = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            recaptchaToken: token,
          }),
        }
      );
      const newInquiryJson = await newInquiry.json();
      if (newInquiryJson.success) {
        setSuccess(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout hideJumbotron>
      <div className={styles.main}>
        <h1 className="text-center p-2">{text.contact.title}</h1>
        <Container className="h-75 w-100 mt-2 d-flex justify-content-between">
          <Col>
            <Row>
              <Col>{text.contact.description}</Col>
            </Row>
            <Row
              className={`${styles.container} w-100 h-100 align-items-center`}
            >
              <Col>
                <Row className="d-flex align-items-center">
                  <Col lg={1} className={styles.iconWrapper}>
                    <FontAwesomeIcon
                      className={styles.iconContainer}
                      icon={brands('whatsapp')}
                    />
                  </Col>
                  <Col>
                    <Nav.Link href={`https://wa.me/${text.phoneNumber}`}>
                      {text.phoneNumber}
                    </Nav.Link>
                  </Col>
                </Row>
                <Row className="d-flex align-items-center w-auto">
                  <Col lg={1} className={styles.iconWrapper}>
                    <FontAwesomeIcon
                      className={styles.iconContainer}
                      icon={regular('envelope')}
                    />
                  </Col>
                  <Col>
                    <Nav.Link href={`mailto:${text.email}`}>
                      {text.email}
                    </Nav.Link>
                  </Col>
                </Row>
              </Col>
              <Col className="h-100 w-100 d-flex align-items-center justify-content-center flex-column">
                <AnimatePresence>
                  {success && (
                    <motion.div layout>
                      <Alert variant="success" className="w-100 text-center">
                        {text.contact.success}
                      </Alert>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div>
                      <Alert variant="danger" className="w-100 text-center">
                        {text.contact.error}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!error && !success && (
                  <>
                    <Row className="d-flex flex-column">
                      <Form as={Col}>
                        <Form.Group>
                          <Form.Label>{text.contact.name}</Form.Label>
                          <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Input
                                autocomplete="given-name"
                                focusedBorderColor="#4502C6"
                                ref={field.ref}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error}
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>{text.contact.phone}</Form.Label>
                          <Controller
                            name="phone"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Input
                                autocomplete="tel"
                                focusedBorderColor="#4502C6"
                                ref={field.ref}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error}
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>{text.contact.email}</Form.Label>
                          <Controller
                            name="email"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Input
                                autocomplete="email"
                                focusedBorderColor="#4502C6"
                                ref={field.ref}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error}
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label>{text.contact.message}</Form.Label>
                          <Form.Control
                            {...register('message')}
                            as="textarea"
                            className={styles.textArea}
                            isInvalid={!!errors.message}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.message?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Form>
                    </Row>
                    <Row>
                      <Col className="d-flex justify-content-end mt-3">
                        <Button
                          className={styles.submitButton}
                          variant="primary"
                          type="submit"
                          onClick={handleSubmit(submitForm)}
                        >
                          {loading ? (
                            <Spinner animation="border" variant="light" />
                          ) : (
                            <>{text.contact.send}</>
                          )}
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Col>
            </Row>
          </Col>
        </Container>
      </div>
    </MainLayout>
  );
};

export default Contact;
