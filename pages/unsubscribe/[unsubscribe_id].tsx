import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Divider } from '@mui/material';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { MessagesType, UnsubscribeType } from '@prisma/client';
import MainLayout from '../../components/Layouts/MainLayout';
import styles from '../../styles/unsubscribe.module.scss';
import ToastContent from '../../components/Toast/ToastContent';

const schema = yup.object().shape({
  form: yup.string().required(),
  email: yup
    .string()
    .email('כתובת הדוא"ל אינה תקינה')
    .when('form', {
      is: 'unsubscribe',
      then: yup.string().email('כתובת הדוא"ל אינה תקינה').required('שדה חובה'),
    }),
  whatsapp: yup.boolean().when('form', {
    is: 'update',
    then: yup.boolean().required(),
  }),
  updatesEmail: yup.boolean().when('form', {
    is: 'update',
    then: yup.boolean().required(),
  }),
  sms: yup.boolean().when('form', {
    is: 'update',
    then: yup.boolean().required(),
  }),
  commercial: yup.boolean().when('form', {
    is: 'update',
    then: yup.boolean().required(),
  }),
  notifications: yup.boolean().when('form', {
    is: 'update',
    then: yup.boolean().required(),
  }),
});

const UserId = () => {
  const [pageLoading, setPageLoading] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      form: 'unsubscribe',
      email: '',
      whatsapp: true,
      updatesEmail: true,
      sms: true,
      commercial: true,
      notifications: true,
    },
  });
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { unsubscribe_id } = router.query;

  useEffect(() => {
    (async () => {
      try {
        setPageLoading(true);
        if (!unsubscribe_id) return;
        const currentPreferencesRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe/${unsubscribe_id}`
        );
        const currentPreferencesJson = await currentPreferencesRes.json();
        if (currentPreferencesJson.success && currentPreferencesJson.data) {
          reset({
            email: '',
            whatsapp: !currentPreferencesJson.data.type.includes(
              UnsubscribeType.WHATSAPP
            ),
            updatesEmail: !currentPreferencesJson.data.type.includes(
              UnsubscribeType.EMAIL
            ),
            sms: !currentPreferencesJson.data.type.includes(
              UnsubscribeType.SMS
            ),
            commercial: !currentPreferencesJson.data.messageType.includes(
              MessagesType.COMMERCIAL
            ),
            notifications: !currentPreferencesJson.data.messageType.includes(
              MessagesType.NOTIFICATION
            ),
          });
        } else if (
          !currentPreferencesJson.success &&
          currentPreferencesJson.name === 'UNSUBSCRIBE_ERROR'
        ) {
          await router.push('/error?error=Unsubscribe');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    })();
  }, [unsubscribe_id]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setValue('form', 'update');
      const func = handleSubmit(async (data) => {
        const updatedDataRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe/${unsubscribe_id}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              updatesEmail: data.updatesEmail,
              whatsapp: data.whatsapp,
              sms: data.sms,
              commercial: data.commercial,
              notifications: data.notifications,
            }),
          }
        );
        const updatedDataJson = await updatedDataRes.json();
        if (updatedDataJson.success) {
          reset({
            whatsapp: !updatedDataJson.data.type.includes(
              UnsubscribeType.WHATSAPP
            ),
            updatesEmail: !updatedDataJson.data.type.includes(
              UnsubscribeType.EMAIL
            ),
            sms: !updatedDataJson.data.type.includes(UnsubscribeType.SMS),
            commercial: !updatedDataJson.data.messageType.includes(
              MessagesType.COMMERCIAL
            ),
            notifications: !updatedDataJson.data.messageType.includes(
              MessagesType.NOTIFICATION
            ),
          });
          toast.success(<ToastContent content={'ההעדפות עודכנו בהצלחה'} />);
        }
      });
      await func();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setLoading(true);
      setValue('form', 'unsubscribe');
      const func = handleSubmit(async (data) => {
        const unsubscribeRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/unsubscribe/${unsubscribe_id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
            }),
          }
        );
        const unsubscribeJson = await unsubscribeRes.json();
        if (unsubscribeJson.success) {
          reset({
            email: '',
            whatsapp: !unsubscribeJson.data.type.includes(
              UnsubscribeType.WHATSAPP
            ),
            updatesEmail: !unsubscribeJson.data.type.includes(
              UnsubscribeType.EMAIL
            ),
            sms: !unsubscribeJson.data.type.includes(UnsubscribeType.SMS),
            commercial: !unsubscribeJson.data.messageType.includes(
              MessagesType.COMMERCIAL
            ),
            notifications: !unsubscribeJson.data.messageType.includes(
              MessagesType.NOTIFICATION
            ),
          });
          toast.success(<ToastContent content={'ההסרה בוצעה בהצלחה'} />);
        } else if (
          !unsubscribeJson.success &&
          unsubscribeJson.name === 'USER_NOT_FOUND'
        ) {
          toast.error(<ToastContent content={'כתובת הדוא"ל לא תואמת'} />);
        }
      });
      await func();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout
      title="הסרה מרשימת תפוצה"
      metaCanonical={`
      }${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe/${unsubscribe_id}`}
      hideJumbotron
    >
      <div className={styles.main}>
        <Container>
          {pageLoading ? (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Row>
                <Col>
                  <div>
                    <h1>איזה באסה!</h1>
                  </div>
                  <div className={styles.textContent}>
                    <span>אנו מצטערים</span>, שאתם שוקלים להסיר את עצמכם מרשימת
                    התפוצה שלנו.
                    <br />
                    לאחרונה עשינו כמה שינויים שמאפשרים לנו להציע לכם לקבל את
                    המידע שאתם באמת צריכים.
                    <br />
                    אז ספרו לנו איזה מידע תרצו לקבל ואנחנו נשמח להמשיך לשלוח לכם
                    את המידע שמתאים לכם.
                  </div>
                </Col>
              </Row>
              <Form>
                <Row className={styles.formContainer}>
                  <Col>
                    <Row className={styles.formTitle}>
                      <Col>
                        <h5>אני מעוניין/ת לקבל עדכונים דרך</h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Check
                          {...register('whatsapp')}
                          type="checkbox"
                          label="WhatsApp"
                        />
                        <Form.Check
                          {...register('updatesEmail')}
                          type="checkbox"
                          label={'דוא"ל'}
                        />
                        <Form.Check
                          {...register('sms')}
                          type="checkbox"
                          label="SMS"
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <Row className={styles.formTitle}>
                      <Col>
                        <h5>אני מעוניין/ת לקבל עדכונים על</h5>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Form.Check
                          {...register('commercial')}
                          type="checkbox"
                          label="החשבון שלי"
                        />
                        <Form.Check
                          {...register('notifications')}
                          type="checkbox"
                          label="קופונים/הצעות שוות"
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <Row className={styles.buttonContainer}>
                  <Col>
                    <Button
                      disabled={loading}
                      onClick={handleUpdate}
                      variant="primary"
                    >
                      {loading ? (
                        <Spinner
                          animation="border"
                          size="sm"
                          style={{ color: '#fff' }}
                        />
                      ) : (
                        'אישור'
                      )}
                    </Button>
                  </Col>
                </Row>
                <Divider className={styles.divider} />
                <Row>
                  <Col>
                    <h4>מעדיף שתסירו אותי מרשימת התפוצה</h4>
                  </Col>
                </Row>
                <Row className={styles.unsubscribeForm}>
                  <Col className={styles.emailLabel}>
                    <Form.Label>אנא הזינו את כתובת הדוא&quot;ל שלכם</Form.Label>
                    <Form.Control
                      className="w-25"
                      {...register('email')}
                      id="email"
                      aria-label="email"
                      type="email"
                      placeholder={'דוא"ל'}
                      isInvalid={!!errors.email}
                    ></Form.Control>
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Col>
                </Row>
                <Row className={styles.buttonContainer}>
                  <Col>
                    <Button
                      disabled={loading}
                      onClick={handleUnsubscribe}
                      variant="primary"
                    >
                      {loading ? (
                        <Spinner
                          animation="border"
                          size="sm"
                          style={{ color: '#fff' }}
                        />
                      ) : (
                        'אישור'
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </>
          )}
        </Container>
      </div>
    </MainLayout>
  );
};

export default UserId;
