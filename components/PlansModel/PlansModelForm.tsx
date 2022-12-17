import React, { useEffect } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Prisma, Bundle, Refill, Coupon } from '@prisma/client';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import styles from './PlansModelForm.module.scss';

type PlansModelFormProps = {
  bundles: Bundle[];
  refills: Refill[];
  setBundle: (
    bundle: Bundle & Prisma.BundleGetPayload<{ select: { refills: true } }>
  ) => void;
  coupons: Coupon[];
};

const schema = yup.object().shape({
  bundleId: yup
    .string()
    .test('is-none', 'Bundle is required', (value) => value !== 'none'),
  refillId: yup
    .string()
    .test('is-none', 'Refill is required', (value) => value !== 'none'),
  name: yup.string().required('Name is required'),
  description: yup.string(),
  price: yup.number().required('Price is required'),
  vat: yup.boolean(),
  couponsIds: yup.string(),
});

const PlansModelForm = ({ bundles, refills, coupons }: PlansModelFormProps) => {
  const [filteredRefills, setFilteredRefills] = React.useState<Refill[]>(
    refills
  );
  const [chosenBundle, setChosenBundle] = React.useState<Bundle | null>(null);
  const [chosenRefill, setChosenRefill] = React.useState<Refill | null>(null);
  const { resolve, hide } = useModal('add-plansmodel');
  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      bundleId: 'none',
      refillId: 'none',
      name: '',
      description: '',
      price: '',
      vat: false,
      couponsIds: 'none',
    },
  });
  const selectedBundle = watch('bundleId');
  const selectedRefill = watch('refillId');

  useEffect(() => {
    if (selectedBundle === 'none') {
      setFilteredRefills(refills);
      setChosenBundle(null);
      return;
    }
    const bundle = bundles.find(
      (bundleOfBundles) => bundleOfBundles.id === selectedBundle
    );
    if (!bundle) {
      setFilteredRefills(refills);
      setChosenBundle(null);
    } else {
      setFilteredRefills(
        refills.filter((refill) => refill.bundleId === selectedBundle)
      );
      setChosenBundle(bundle);
    }
  }, [selectedBundle, bundles, refills]);

  useEffect(() => {
    if (selectedRefill === 'none') {
      setChosenRefill(null);
    } else {
      const refill = refills.find(
        (refillOfRefills) => refillOfRefills.id === selectedRefill
      );
      if (!refill) {
        setChosenRefill(null);
      } else {
        setChosenRefill(refill);
      }
    }
  }, [selectedRefill, refills]);

  return (
    <Form>
      <Form.Group>
        <Form.Label>Bundle</Form.Label>
        <Form.Select {...register('bundleId')} isInvalid={!!errors.bundleId}>
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
        <Form.Control.Feedback type="invalid">
          {errors.bundleId?.message}
        </Form.Control.Feedback>
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
        <Form.Select
          {...register('couponsIds')}
          isInvalid={!!errors.couponsIds}
        >
          {coupons.length ? (
            coupons.map((coupon) => (
              <option key={coupon.id} value={coupon.id as string}>{`${
                coupon.discount
              }${coupon.discountType === 'PERCENT' ? '%' : 'ש"ח'}`}</option>
            ))
          ) : (
            <option value="none">No Coupons</option>
          )}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {errors.couponsIds?.message}
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
        Save Changes
      </Button>
    </Form>
  );
};

export default PlansModelForm;
