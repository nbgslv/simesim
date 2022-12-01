import React, { useEffect } from 'react';
import { Button, Col, Modal, Row, Form, Spinner } from 'react-bootstrap';
import DatePicker, { registerLocale } from 'react-datepicker';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useForm, Controller } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AnimatePresence, motion } from 'framer-motion';
import he from 'date-fns/locale/he';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useRouter } from 'next/router';
import { Coupon, PlanModel } from '@prisma/client';
import styles from './OrderModal.module.scss';
import Input from '../Input/Input';

type BundlesSectionProps = {
  show: boolean;
  onHide: () => void;
  bundle?: PlanModel;
  country?: string;
};

const schema = yup.object().shape({
  startDate: yup
    .date()
    .min(new Date(), 'תאריך לא תקין')
    .required('שדה חובה')
    .nullable(true),
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'תאריך לא תקין')
    .required('שדה חובה')
    .nullable(true),
  firstName: yup.string().required('שדה חובה'),
  lastName: yup.string().required('שדה חובה'),
  email: yup.string().email('דוא"ל לא תקין').required('שדה חובה'),
  phoneNumber: yup.string().length(10, 'טלפון לא תקין').required('שדה חובה'),
  terms: yup.boolean().oneOf([true]).required('שדה חובה'),
});

const OrderModal = ({ show, onHide, bundle, country }: BundlesSectionProps) => {
  const [price, setPrice] = React.useState<number>(0);
  const [coupon, setCoupon] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);
  const [couponSet, setCouponSet] = React.useState<string>('');
  const [
    couponDetails,
    setCouponDetails,
  ] = React.useState<Partial<Coupon> | null>(null);
  const [couponError, setCouponError] = React.useState<string>('');
  const [loadingCoupon, setLoadingCoupon] = React.useState<boolean>(false);
  const [couponStatus, setCouponStatus] = React.useState<
    'valid' | 'invalid' | 'none'
  >('none');
  const { executeRecaptcha } = useGoogleReCaptcha();
  const router = useRouter();

  useEffect(() => {
    if (bundle) {
      setPrice(bundle.price);
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

  registerLocale('he', he);
  const {
    getValues,
    watch,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      startDate: null,
      endDate: null,
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      terms: false,
    },
  });
  const startDate = watch('startDate');
  const phoneNumber = watch('phoneNumber');

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
              תאריכי נסיעה
            </Col>
            <Col className={styles.dateInput}>
              <Controller
                name="startDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="מתאריך"
                    minDate={new Date()}
                    openToDate={new Date()}
                    isClearable
                    locale="he"
                  />
                )}
              />
              {errors.startDate && (
                <AnimatePresence>
                  <motion.div
                    key={1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.errorMessage}
                  >
                    {errors.startDate.message as string}
                  </motion.div>
                </AnimatePresence>
              )}
            </Col>
            <Col className={styles.dateInput}>
              <Controller
                name="endDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="עד תאריך"
                    minDate={getValues('startDate')}
                    openToDate={getValues('startDate') || undefined}
                    isClearable
                    disabled={!startDate}
                    locale="he"
                  />
                )}
              />
              {errors.endDate && (
                <AnimatePresence>
                  <motion.div
                    key={1}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.errorMessage}
                  >
                    {errors.endDate.message as string}
                  </motion.div>
                </AnimatePresence>
              )}
            </Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'הזן שם פרטי' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="שם פרטי"
                    autocomplete="given-name"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
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
                name="lastName"
                control={control}
                rules={{ required: 'הזן שם משפחה' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="שם משפחה"
                    autocomplete="family-name"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
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
                rules={{ required: 'הזו טלפון נייד' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder="טלפון נייד"
                    autocomplete="tel"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              <small>מספר זה ישמש בעת התחברות לחשבונך</small>
            </Col>
          </Row>
          <Row className={styles.orderModalRow}>
            <Col>
              <Controller
                name="email"
                control={control}
                rules={{ required: 'הזן דוא"ל' }}
                render={({ field, fieldState }) => (
                  <Input
                    {...field}
                    placeholder={'דוא"ל'}
                    autocomplete="email"
                    focusedBorderColor="#FFC107"
                    ref={field.ref}
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error}
                  />
                )}
              />
              <small>לכתובת דוא&quot;ל זו ישלח קוד QR להפעלת הכרטיס</small>
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
