import React from 'react';
import { Button, Col, Modal, Row, Form, Spinner } from 'react-bootstrap';
import DatePicker, { registerLocale } from 'react-datepicker';
import { useForm, Controller } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AnimatePresence, motion } from 'framer-motion';
import he from 'date-fns/locale/he';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { useRouter } from 'next/router';
import { Bundle, Refill } from '@prisma/client';
import styles from './OrderModal.module.scss';
import Input from '../Input/Input';

type BundlesSectionProps = {
  show: boolean;
  onHide: () => void;
  bundle?: Bundle;
  refill?: Refill | null;
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

const OrderModal = ({
  show,
  onHide,
  bundle,
  refill,
  country,
}: BundlesSectionProps) => {
  const [coupon, setCoupon] = React.useState<string>('');
  const [couponSet, setCouponSet] = React.useState<string>('');
  const [couponError, setCouponError] = React.useState<string>('');
  const [loadingCoupon, setLoadingCoupon] = React.useState<boolean>(false);
  const [couponStatus, setCouponStatus] = React.useState<
    'valid' | 'invalid' | 'none'
  >('none');
  const router = useRouter();

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
          `/api/coupon/${coupon}/${phoneNumber}`
        );
        if (couponResult.status === 200) {
          setCouponError('');
          setCouponStatus('valid');
          setCouponSet(coupon);
        } else {
          const couponErrorMessages = await couponResult.json();
          setCouponStatus('invalid');
          setCouponError(couponErrorMessages.message);
        }
      }
    } catch (e) {
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
        variant="secondary"
        className={`${styles.submitButton} w-100 h-100`}
        onClick={() => handleCoupon()}
      >
        הפעל קופון
      </Button>
    );
  };

  const handleCouponClear = () => {
    setCouponStatus('none');
    setCouponError('');
    setCouponSet('');
  };

  const onSubmit = async (data: any) => {
    // eslint-disable-next-line no-param-reassign
    refill!.id = 'clamghwdk00e1544knz513j4r'; // TODO: remove this
    const res = await fetch('/api/order', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        coupon: couponSet,
        bundle: 'clamghwdj00e0544kl4ezigs8', // TODO: change to real bundle id
        refill: refill?.id,
        price: refill?.price_usd ?? 1.2, // TODO: change to real planModel price
        planModel: 'clamhftss000054f8ca66alty', // TODO: change to real planModel id
      }),
    });
    if (res.redirected) {
      await router.push(res.url);
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
            <Col className="d-flex">
              <div className={styles.bundleText}>{bundle?.name} -</div>
              <div className={styles.bundleText}>{refill?.title}</div>
              <div className={styles.bundleText}>
                {refill ? refill.price_usd + 1.2 : ''}$
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
              <small>לכתובת דוא"ל זו ישלח קוד QR להפעלת הכרטיס</small>
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
              המשך
            </Button>
          </div>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default OrderModal;
