import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Form, Spinner } from 'react-bootstrap';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useForm, Controller } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useRouter } from 'next/router';
import { Coupon, PlanModel, Prisma } from '@prisma/client';
import { Context, useUserStore } from '../../lib/context/UserStore';
import { Action } from '../../lib/reducer/reducer';
import styles from './OrderModal.module.scss';
import Input from '../Input/Input';

type BundlesSectionProps = {
  show: boolean;
  onHide: () => void;
  bundle?: PlanModel &
    Prisma.PlanModelGetPayload<{ select: { bundle: true; refill: true } }>;
  country?: string;
};

const schema = yup.object().shape({
  firstName: yup.string().required('שדה חובה'),
  lastName: yup.string().required('שדה חובה'),
  email: yup.string().email('דוא"ל לא תקין').required('שדה חובה'),
  phoneNumber: yup.string().length(10, 'טלפון לא תקין').required('שדה חובה'),
  terms: yup.boolean().oneOf([true]).required('שדה חובה'),
});

const OrderModal = ({ show, onHide, bundle, country }: BundlesSectionProps) => {
  const [price, setPrice] = useState<number>(0);
  const [amountDays, setAmountDays] = useState<number>(0);
  const [coupon, setCoupon] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [couponSet, setCouponSet] = useState<string>('');
  const [couponDetails, setCouponDetails] = useState<Partial<Coupon> | null>(
    null
  );
  const [couponError, setCouponError] = useState<string>('');
  const [loadingCoupon, setLoadingCoupon] = useState<boolean>(false);
  const [couponStatus, setCouponStatus] = useState<
    'valid' | 'invalid' | 'none'
  >('none');
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { state } = useUserStore() as Context<Action>;
  const router = useRouter();

  useEffect(() => {
    if (bundle) {
      setPrice(bundle.price);
      setAmountDays(bundle.refill.amount_days || 0);
    }
  }, [bundle]);

  useEffect(() => {
    if (couponDetails && couponDetails.discount && bundle) {
      if (couponDetails.discountType === 'PERCENT') {
        setPrice(bundle.price - (bundle.price * couponDetails.discount) / 100);
      } else if (couponDetails.discountType === 'AMOUNT') {
        setPrice(bundle.price - couponDetails.discount);
      }
    } else if (bundle) {
      setPrice(bundle.price);
    }
  }, [couponDetails]);

  const { watch, control, handleSubmit, reset } = useForm({
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
  const phoneNumber = watch('phoneNumber');

  useEffect(() => {
    if (state.user.id) {
      reset({
        firstName: state.user.name.split(' ')[0],
        lastName: state.user.name.split(' ')[1],
        phoneNumber: state.user.email,
        email: state.user.emailEmail,
      });
    }
  }, [state]);

  const handleCoupon = async () => {
    try {
      if (!phoneNumber) {
        setCouponError('נא להזין מספר טלפון');
        return;
      }
      setLoadingCoupon(true);
      if (coupon) {
        setCouponSet(coupon);
        setLoadingCoupon(true);
        const couponResult = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/coupon/${coupon}/${phoneNumber}`
        );
        if (couponResult.status === 200) {
          const { data } = await couponResult.json();
          setCouponDetails(data);
          setCouponError('');
          setCouponStatus('valid');
          setCouponSet(coupon);
        } else {
          const couponErrorMessages = await couponResult.json();
          setCouponDetails(null);
          setCouponStatus('invalid');
          setCouponError(couponErrorMessages.message);
        }
      }
    } catch (e) {
      setCouponDetails(null);
      setCouponError('');
      setCouponStatus('invalid');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const getCouponStatus = () => {
    if (loadingCoupon) {
      return (
        <div className={styles.spinnerContainer}>
          <Spinner animation="border" size="sm" />
        </div>
      );
    }
    if (couponStatus === 'valid') {
      return (
        <div className={styles.statusIconSuccess}>
          <FontAwesomeIcon icon={solid('check')} />
        </div>
      );
    }
    if (couponStatus === 'invalid') {
      return (
        <div className={styles.statusIconWarning}>
          <FontAwesomeIcon icon={solid('x')} />
        </div>
      );
    }
    return (
      <Button
        variant="outline-success"
        className={`${styles.couponButton} w-100 h-100`}
        onClick={() => handleCoupon()}
      >
        הפעל קופון
      </Button>
    );
  };

  const handleCouponClear = () => {
    setCouponDetails(null);
    setCouponStatus('none');
    setCouponError('');
    setCouponSet('');
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      if (!executeRecaptcha) {
        throw new Error('Recaptcha not loaded');
      }
      const token = await executeRecaptcha('order');
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          price,
          recaptchaToken: token,
          coupon: couponDetails?.id,
          planModel: bundle?.id,
        }),
      });
      if (res.redirected) {
        await router.push(res.url);
      } else {
        const json = await res.json();
        if (!json.success) {
          await router.push('/error?error=Order');
        }
      }
    } catch (e) {
      console.error(e);
      await router.push('/error?error=Order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className={styles.main}
    >
      <form>
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
            <Col className="d-flex justify-content-between">
              <div className="d-flex">
                <div className={styles.bundleText}>{bundle?.name} -</div>
                <div className={styles.bundleText}>{bundle?.description}</div>
              </div>
              <div
                className={`${styles.bundleTextPrice} ${
                  couponDetails ? styles.couponSuccess : ''
                }`}
              >
                סה&quot;כ: {price}
                {'\u20AA'}
              </div>
            </Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col className={styles.omFieldTitle} lg={3}>
              לאן טסים
            </Col>
            <Col className={styles.countryText}>{country}</Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col className={styles.omFieldTitle} lg={3}>
              תוקף החבילה
            </Col>
            <Col className={styles.dateInput}>
              <div className={styles.amountDaysText}>
                {amountDays !== 0
                  ? `החבילה תהיה תקפה מרגע הפעלתה ולמשך ${amountDays} ימים`
                  : `החבילה תהיה תקפה מרגע הפעלתה ועד שנה לאחר מכן`}
              </div>
            </Col>
          </Row>
          {state.user.id && (
            <Row className={styles.orderModalRow}>
              <small>
                <strong>נא לוודא שפרטיך נכונים. לעדכון הפרטים האישיים</strong>
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
                    autocomplete="given-name"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    readonly={!!state.user.id}
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
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    readonly={!!state.user.id}
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
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    readonly={!!state.user.id}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              {!state.user.id && (
                <small>מספר זה ישמש בעת התחברות לחשבונך</small>
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
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    readonly={!!state.user.id}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              {!state.user.id && (
                <small>לכתובת דוא&quot;ל זו ישלח קוד QR להפעלת הכרטיס</small>
              )}
            </Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col lg={8}>
              <Input
                placeholder={'קופון'}
                focusedBorderColor="#FFC107"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                error={couponError}
                readonly={!!couponSet}
                cancelButton={!!couponSet}
                handleCancel={handleCouponClear}
              />
            </Col>
            <Col>{getCouponStatus()}</Col>
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
                  <Form.Check.Label>
                    אני מאשר/ת את&nbsp;
                    <a href="/terms" target="_blank">
                      תנאי השימוש
                    </a>
                  </Form.Check.Label>
                </Form.Check>
              )}
            />
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              className={styles.submitButton}
            >
              {loading ? (
                <Spinner
                  animation="border"
                  size="sm"
                  style={{ color: '#ffffff' }}
                />
              ) : (
                <>המשך</>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default OrderModal;
