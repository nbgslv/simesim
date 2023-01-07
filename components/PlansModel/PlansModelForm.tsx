import React, { useEffect } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Bundle, Refill, Coupon } from '@prisma/client';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import styles from './PlansModelForm.module.scss';
import AdminSelect from '../AdminSelect/AdminSelect';

type PlansModelFormProps = {
  bundles: Bundle[];
  refills: Refill[];
  coupons: Coupon[];
  loading: boolean;
};

const schema = yup.object().shape({
  refillId: yup
    .string()
    .test('is-none', 'Refill is required', (value) => value !== 'none'),
  name: yup.string().required('Name is required'),
  description: yup.string(),
  price: yup.number().required('Price is required'),
  vat: yup.boolean(),
  couponsIds: yup.array().of(yup.string()),
});

const PlansModelForm = ({
  bundles,
  refills,
  coupons,
  loading,
}: PlansModelFormProps) => {
  const [filteredRefills, setFilteredRefills] = React.useState<Refill[]>(
    refills
  );
  const [chosenBundle, setChosenBundle] = React.useState<Bundle | null>(null);
  const [chosenRefill, setChosenRefill] = React.useState<Refill | null>(null);
  const { resolve, hide } = useModal('add-plansmodel');
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      refillId: 'none',
      name: '',
      description: '',
      price: '',
      vat: false,
      couponsIds: [],
    },
  });
  const selectedRefill = watch('refillId');

  useEffect(() => {
    if (bundles.length > 0 && !chosenBundle) {
      setChosenBundle(bundles[0]);
      const tempRefills = refills.filter(
        (refill) => refill.bundleId === bundles[0].id
      );
      setFilteredRefills(tempRefills);
      setChosenRefill(tempRefills[0]);
      setValue('refillId', tempRefills[0].id);
    }
  }, [bundles]);

  useEffect(() => {
    const tempRefills = refills.filter(
      (refill) => refill.bundleId === chosenBundle?.id
    );
    if (tempRefills.length > 0) {
      setFilteredRefills(tempRefills);
      setChosenRefill(tempRefills[0]);
      setValue('refillId', tempRefills[0].id);
    }
  }, [chosenBundle]);

  useEffect(() => {
    if (selectedRefill !== 'none' && selectedRefill !== chosenRefill?.id) {
      const refill = filteredRefills.find(
        (filteredRefill) => filteredRefill.id === selectedRefill
      );
      setChosenRefill(refill || null);
    }
  }, [selectedRefill]);

  return (
    <Form>
      <Form.Group>
        <Form.Label>Bundle</Form.Label>
        <Form.Select
          onChange={(e) =>
            setChosenBundle(
              bundles.find((bundle) => bundle.id === e.target.value) || null
            )
          }
        >
          {bundles.length ? (
            bundles.map((bundle) => (
              <option key={bundle.id} value={bundle.id as string}>
                {bundle.name}
              </option>
            ))
          ) : (
            <option value="none">No Bundles</option>
          )}
        </Form.Select>
        {chosenBundle && (
          <Form.Text>Description: {chosenBundle.description}</Form.Text>
        )}
      </Form.Group>
      <Form.Group>
        <Form.Label>Refill</Form.Label>
        <Form.Select {...register('refillId')} isInvalid={!!errors.refillId}>
          {filteredRefills.length ? (
            filteredRefills.map((refill) => (
              <option key={refill.id} value={refill.id as string}>
                {refill.title}
              </option>
            ))
          ) : (
            <option value="none">No Refills</option>
          )}
        </Form.Select>
        {chosenRefill && (
          <Form.Text>
            Title: {chosenRefill.title}; MB: {chosenRefill.amount_mb}; Days:{' '}
            {chosenRefill.amount_days || '\u221E'}; Price:{' '}
            {chosenRefill.price_usd}$
          </Form.Text>
        )}
        <Form.Control.Feedback type="invalid">
          {errors.refillId?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Name"
          {...register('name')}
          isInvalid={!!errors.name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control
          type="textarea"
          placeholder="Enter Description"
          {...register('description')}
          isInvalid={!!errors.description}
        />
        <Form.Control.Feedback type="invalid">
          {errors.description?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Price</Form.Label>
        <InputGroup>
          <Form.Control
            type="number"
            placeholder="Price"
            aria-label="price"
            aria-describedby="currency"
            {...register('price')}
            isInvalid={!!errors.price}
          />
          <InputGroup.Text id="currency">{'\u20AA'}</InputGroup.Text>
        </InputGroup>
        <Form.Control.Feedback type="invalid">
          {errors.price?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Check
          type="switch"
          id="vat"
          label="Vat"
          {...register('vat')}
          isInvalid={!!errors.vat}
        />
        <Form.Control.Feedback type="invalid">
          {errors.vat?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Coupons</Form.Label>
        <Controller
          name="couponsIds"
          control={control}
          render={({ field }) => (
            <AdminSelect
              ariaLabel="Coupons"
              options={coupons.map((coupon) => ({
                value: coupon.id,
                label: `${coupon.code} - ${coupon.discount}${
                  coupon.discountType === 'PERCENT' ? '%' : '\u20AA'
                }`,
              }))}
              isMulti
              onSelect={(options) => {
                field.onChange(options.map((option) => option.value));
              }}
              value={field.value.map((id) => {
                const coupon = coupons.find(
                  (couponOfCoupons) => couponOfCoupons.id === id
                );
                return {
                  value: id,
                  label: `${coupon?.code || ''} - ${coupon?.discount || ''}${
                    (coupon?.discountType === 'PERCENT' ? '%' : '\u20AA') ?? ''
                  }`,
                };
              })}
            />
          )}
        />
        <Form.Control.Feedback type="invalid">
          {errors.couponsIds?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Button
        variant="secondary"
        onClick={() => hide()}
        className={`
                }${styles.closeButton} me-2`}
      >
        Close
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit((data) => resolve(data))}
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? (
          <Spinner animation="border" size="sm" style={{ color: '#fff' }} />
        ) : (
          'Save Changes'
        )}
      </Button>
    </Form>
  );
};

export default PlansModelForm;
