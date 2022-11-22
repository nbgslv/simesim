import React, { ChangeEvent } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { PlanModel } from '@prisma/client';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import styles from './CouponsForm.module.scss';

const schema = yup.object().shape({
  code: yup.string().required('Code is required'),
  discount: yup
    .number()
    .required('Discount is required')
    .min(0, 'Discount must be greater than 0'),
  type: yup.mixed().oneOf(['PERCENT', 'AMOUNT']).required('Type is required'),
  validFrom: yup.date().required('Valid from is required').nullable(true),
  validTo: yup.date().required('Valid from is required').nullable(true),
  maxUsesPerUser: yup
    .number()
    .required('Max uses per user is required')
    .min(1, 'Max uses per user must be greater than 0'),
  maxUsesTotal: yup
    .number()
    .required('Max uses total is required')
    .min(-1, 'Max uses total must be greater than 0'),
  planModel: yup.string(),
});

const CouponsForm = ({
  plansModel,
  loading,
}: {
  plansModel: PlanModel[];
  loading: boolean;
}) => {
  const { resolve, hide } = useModal('add-coupons');
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    handleSubmit,
    control,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      code: '',
      discount: 0,
      type: 'PERCENT',
      validFrom: null,
      validTo: null,
      maxUsesPerUser: 1,
      maxUsesTotal: -1,
      planModel: '',
    },
  });
  const maxUsesTotal = watch('maxUsesTotal');

  return (
    <Form>
      <Form.Group>
        <Form.Label>Code</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Coupon Code"
          {...register('code')}
          isInvalid={!!errors.code}
        />
        <Form.Control.Feedback type="invalid">
          {errors.code?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Discount</Form.Label>
        <Form.Control
          type="number"
          placeholder="Discount"
          {...register('discount')}
          isInvalid={!!errors.discount}
        />
        <Form.Control.Feedback type="invalid">
          {errors.discount?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Type</Form.Label>
        <Form.Select {...register('type')} isInvalid={!!errors.type}>
          <option value={'PERCENT'}>%</option>
          <option value={'AMOUNT'}>{'\u20AA'}</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.type?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Valid From</Form.Label>
        <Controller
          name="validFrom"
          control={control}
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors.validFrom?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Valid Until</Form.Label>
        <Controller
          name="validTo"
          control={control}
          render={({ field }) => (
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              dateFormat="dd/MM/yyyy"
              className="form-control"
            />
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors.validTo?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Max Uses Per User</Form.Label>
        <Form.Control
          type="number"
          {...register('maxUsesPerUser')}
          isInvalid={!!errors.maxUsesPerUser}
        />
        <Form.Control.Feedback type="invalid">
          {errors.maxUsesPerUser?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Max Uses Per User</Form.Label>
        <InputGroup>
          <InputGroup.Checkbox
            onClick={(e: ChangeEvent<HTMLInputElement>) =>
              setValue('maxUsesTotal', e.target.checked ? 0 : -1)
            }
          />
          <Form.Control
            type="number"
            min={0}
            disabled={maxUsesTotal < 0}
            {...register('maxUsesTotal')}
            value={maxUsesTotal < 0 ? 0 : maxUsesTotal}
            isInvalid={!!errors.maxUsesTotal}
          />
        </InputGroup>
        <Form.Control.Feedback type="invalid">
          {errors.maxUsesTotal?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Plan Model</Form.Label>
        <Form.Select {...register('planModel')} isInvalid={!!errors.planModel}>
          <option value={''}>None</option>
          {plansModel.length ? (
            plansModel.map((planModel) => (
              <option key={planModel.id} value={planModel.id as string}>
                {planModel.name}
              </option>
            ))
          ) : (
            <option value="none">No Plans</option>
          )}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.planModel?.message}
        </Form.Control.Feedback>
      </Form.Group>
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
        {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
      </Button>
    </Form>
  );
};

export default CouponsForm;
