import React from 'react';
import MainLayout from '../components/Layouts/MainLayout';
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
import styles from '../styles/contact.module.scss';
import text from '../lib/content/text.json';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Input from '../components/Input/Input';

const schema = yup.object().shape({
  name: yup.string(),
  phone: yup.string().length(10),
  email: yup.string().email().required(),
  message: yup.string().required(),
});

const Contact = () => {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const { register, control, handleSubmit } = useForm({
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
      const inquiryId = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (inquiryId) {
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
              <Col className="h-100 d-flex align-items-center">
                {success && (
                  <Alert variant="success" className="w-100 text-center">
                    {text.contact.success}
                  </Alert>
                )}
                {error && (
                  <Alert variant="danger" className="w-100 text-center">
                    {text.contact.error}
                  </Alert>
                )}
                {!error && !success && (
                  <>
                    <Row>
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
                          />
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
