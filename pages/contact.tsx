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
import { fbpEvent } from '../lib/fbpixel';
import { gtagEvent } from '../lib/gtag';

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
        fbpEvent('Contact', {
          name: data.name,
          phone: data.phone,
          email: data.email,
          message: data.message,
        });
        gtagEvent({
          action: 'contact',
          parameters: {
            name: data.name,
            phone: data.phone,
            email: data.email,
            message: data.message,
          },
        });
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
    <MainLayout
      title="צור קשר"
      metaDescription={'צור קשר'}
      metaCanonical={`${process.env.NEXT_PUBLIC_BASE_URL}/contact`}
      hideJumbotron
    >
      <div className={styles.main}>
        <h1 className="text-center p-2">{text.contact.title}</h1>
        <Container
          className={`h-75 w-100 mt-2 d-flex justify-content-between ${styles.container}`}
        >
          <Col>
            <Row className="mb-3">
              <Col tabIndex={0}>{text.contact.description}</Col>
            </Row>
            <Row
              className={`${styles.containerRow} w-100 h-100 align-items-center`}
            >
              <Col>
                <Row
                  className={`d-flex align-items-center ${styles.contactDetails}`}
                >
                  <Col lg={1} className={styles.iconWrapper}>
                    <FontAwesomeIcon
                      className={styles.iconContainer}
                      icon={brands('whatsapp')}
                    />
                  </Col>
                  <Col>
                    <Nav.Link href={`https://wa.me/${text.phoneNumber}`}>
                      {text.phoneNumberDisplay}
                    </Nav.Link>
                  </Col>
                </Row>
                <Row
                  className={`d-flex align-items-center w-auto ${styles.contactDetails}`}
                >
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
              <Col className="h-100 w-100">
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
                          <Form.Label id="name-label" for="name">
                            {text.contact.name}
                          </Form.Label>
                          <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                              <Input
                                id={field.name}
                                autocomplete="given-name"
                                focusedBorderColor="#4502C6"
                                ref={field.ref}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error}
                                aria-label="name"
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label id="phone-label">
                            {text.contact.phone}
                          </Form.Label>
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
                                aria-label="phone"
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label id="email-label">
                            {text.contact.email}
                          </Form.Label>
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
                                aria-label="email"
                              />
                            )}
                          />
                        </Form.Group>
                        <Form.Group>
                          <Form.Label id="message-label">
                            {text.contact.message}
                          </Form.Label>
                          <Form.Control
                            {...register('message')}
                            as="textarea"
                            className={styles.textArea}
                            isInvalid={!!errors.message}
                            aria-label="message"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.message?.message}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Form>
                    </Row>
                    <Row>
                      <Col
                        className={`d-flex justify-content-center mt-3 mb-3 ${styles.buttonContainer}`}
                      >
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
