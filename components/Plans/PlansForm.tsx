import React, { ChangeEvent, useEffect } from 'react';
import { Button, Col, Form, InputGroup, Row, Spinner } from 'react-bootstrap';
import { Prisma, Payment, PlanModel, User } from '@prisma/client';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './PlansForm.module.scss';

const schema = yup.object().shape({
  planModel: yup
    .string()
    .required('Plan model is required')
    .test('planModel', 'Plan model is required', (value) => value !== 'none'),
  price: yup
    .number()
    .required('Price is required')
    .min(0, 'Price must be greater than 0'),
  user: yup
    .string()
    .required('User is required')
    .test('user', 'User is required', (value) => value !== 'none'),
  allowRefill: yup.boolean().required('Allow refill is required'),
  createLine: yup.boolean().required('Create line is required'),
  payment: yup.string(),
  sendPayment: yup
    .boolean()
    .required('Send payment is required')
    .test(
      'payment',
      "Can't send payment with a payment chosen",
      (value) =>
        ((yup.ref('payment') as unknown) as string) === 'none' || !value
    ),
});

const PlansForm = ({
  plansModel,
  payments,
  users,
  loading,
}: {
  plansModel: (PlanModel &
    Prisma.PlanModelGetPayload<{ select: { refill: true } }>)[];
  payments: (Payment & Prisma.PaymentGetPayload<{ select: { user: true } }>)[];
  users: User[];
  loading: boolean;
}) => {
  const [chosenPlanModel, setChosenPlanModel] = React.useState<
    | (PlanModel & Prisma.PlanModelGetPayload<{ select: { refill: true } }>)
    | null
  >(null);
  const { resolve, hide } = useModal('add-plans');
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      planModel: 'none',
      price: 0,
      user: 'none',
      allowRefill: false,
      createLine: false,
      sendPayment: false,
      payment: 'none',
    },
  });
  const planModel = watch('planModel');
  const sendPayment = watch('sendPayment');

  useEffect(() => {
    if (planModel === 'none') {
      setValue('price', 0);
      setChosenPlanModel(null);
    } else {
      const plan = plansModel.find((p) => p.id === planModel);
      if (plan) {
        setChosenPlanModel(plan);
      } else {
        setChosenPlanModel(null);
      }
      setValue('price', plan?.price || 0);
    }
  }, [planModel, plansModel]);

  return (
    <Form>
      <Form.Group>
        <Form.Label>Plan Model</Form.Label>
        <Form.Select {...register('planModel')} isInvalid={!!errors.planModel}>
          {plansModel.length ? (
            plansModel.map((planModelInput) => (
              <option
                key={planModelInput.id}
                value={planModelInput.id as string}
              >
                {planModelInput.name}
              </option>
            ))
          ) : (
            <option value="none">No Plans</option>
          )}
        </Form.Select>
        {chosenPlanModel && (
          <Form.Text className="text-muted">
            Price: {chosenPlanModel.price}
            {'\u20AA'}; Days: {chosenPlanModel.refill.amount_days}; MB:{' '}
            {chosenPlanModel.refill.amount_mb}
          </Form.Text>
        )}
        <Form.Control.Feedback type="invalid">
          {errors.planModel?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="number"
          placeholder="Price"
          min={0}
          {...register('price')}
          isInvalid={!!errors.price}
        />
        <Form.Control.Feedback type="invalid">
          {errors.price?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>User</Form.Label>
        <Form.Select {...register('user')} isInvalid={!!errors.user}>
          {users.length ? (
            users.map((user) => (
              <option key={user.id} value={user.id}>
                {`${user.firstName} ${user.lastName} - ${user.email}`}
              </option>
            ))
          ) : (
            <option value="none">No Users</option>
          )}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.user?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Payment</Form.Label>
        <InputGroup>
          <InputGroup.Checkbox
            label="Send Payment"
            onClick={(e: ChangeEvent<HTMLInputElement>) =>
              setValue('sendPayment', e.target.checked)
            }
            {...register('sendPayment')}
          />
          <InputGroup.Text>Send Payment</InputGroup.Text>
          <Form.Select
            {...register('payment')}
            isInvalid={!!errors.payment}
            disabled={sendPayment}
          >
            <option value="none">None</option>
            {payments.length ? (
              payments.map((payment) => (
                <option key={payment.id} value={payment.id}>
                  {`${payment.user.firstName} ${payment.user.lastName} - ${payment.i4UClearingLogId}-${payment.paymentDate}`}
                </option>
              ))
            ) : (
              <option value="none">No Payments</option>
            )}
          </Form.Select>
        </InputGroup>
        <Form.Control.Feedback type="invalid">
          {errors.payment?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Row>
        <Form.Group as={Col}>
          <Form.Check
            label="Allow Refill"
            type="checkbox"
            {...register('allowRefill')}
          />
          <Form.Control.Feedback type="invalid">
            {errors.allowRefill?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group as={Col}>
          <Form.Check
            label="Create Line"
            type="checkbox"
            {...register('createLine')}
          />
          <Form.Control.Feedback type="invalid">
            {errors.createLine?.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Row>
      <Button
        variant="secondary"
        onClick={() => hide()}
        className={`${styles.closeButton} me-2`}
      >
        Close
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit((data) => resolve(data))}
        className={styles.submitButton}
      >
        {loading ? <Spinner animation="border" size="sm" /> : 'Create'}
      </Button>
    </Form>
  );
};

export default PlansForm;
