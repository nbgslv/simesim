import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { User } from '@prisma/client';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { Controller, FieldErrors, FieldValues, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Input from '../Input/Input';
import styles from './StepTwo.module.scss';
import ToastContent from '../Toast/ToastContent';
import { Context, useUserStore } from '../../lib/context/UserStore';
import { Action } from '../../lib/reducer/userReducer';

const MotionRow = motion(Row);

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
      setUserEdit,
    }: {
      user: User | null;
      handleValid: (data: FieldValues) => Promise<void>;
      handleErrors?: (errors: FieldErrors<FieldValues>) => Promise<void>;
      setUserEdit: (edit: boolean) => void;
    },
    ref
  ) => {
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, reset } = useForm({
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
    const { state } = useUserStore() as Context<Action>;

    useImperativeHandle(ref, () => ({
      handleSubmit: () =>
        handleSubmit(
          async (data) => {
            await handleValid(data);
          },
          async (errors) => {
            await handleErrors?.(errors);
          }
        ),
      setStepLoading: (loadingState: boolean) => setLoading(loadingState),
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
          {state.user.id && (
            <Row>
              <small>
                <strong>
                  נא לוודא שפרטיך נכונים.{' '}
                  <Button
                    className={styles.editButton}
                    disabled={edit}
                    onClick={() => {
                      setUserEdit(true);
                      setEdit(true);
                    }}
                  >
                    לעדכון הפרטים
                  </Button>
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
                    readonly={Boolean(state.user.id) && !edit}
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
                    readonly={Boolean(state.user.id) && !edit}
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
                    readonly={Boolean(state.user.id) && !edit}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              {!state.user.id && (
                <small className={styles.note}>
                  מספר זה ישמש בעת התחברות לחשבונך
                </small>
              )}
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
                    readonly={Boolean(state.user.id) && !edit}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              {!state.user.id && (
                <small className={styles.note}>
                  לכתובת דוא&quot;ל זו ישלח קוד QR להפעלת הכרטיס
                </small>
              )}
            </Col>
          </Row>
          <AnimatePresence initial={false}>
            {(edit || !state.user.id) && (
              <MotionRow
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
                className="mt-3"
              >
                <Col className="text-center">
                  <Button
                    onClick={handleSubmit(
                      async (data) => {
                        try {
                          setLoading(true);
                          await handleValid(data);
                          setEdit(false);
                          setUserEdit(false);
                        } catch (error) {
                          console.error(error);
                          toast.error(
                            <ToastContent
                              content={'התקבלה שגיאה מהשרת. נסה שנית'}
                            />
                          );
                        } finally {
                          setLoading(false);
                        }
                      },
                      async (errors) => {
                        toast.error(
                          <ToastContent content={'נראה שקיימות שגיאות בטופס'} />
                        );
                        await handleErrors?.(errors);
                      }
                    )}
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      'עדכון פרטים'
                    )}
                  </Button>
                </Col>
              </MotionRow>
            )}
          </AnimatePresence>
        </form>
      </Container>
    );
  }
);

StepTwo.displayName = 'StepTwo';

export default StepTwo;
