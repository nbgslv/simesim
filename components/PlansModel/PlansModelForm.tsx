import React from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Prisma, Bundle, Refill, Coupon } from '@prisma/client';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';

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
  const { resolve, hide } = useModal('add-plansmodel');
  const {
    register,
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
        <Form.Control.Feedback type="invalid">
          {errors.bundleId?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Refill</Form.Label>
        <Form.Select {...register('refillId')} isInvalid={!!errors.refillId}>
          {refills.length ? (
            refills.map((refill) => (
              <option key={refill.id} value={refill.id as string}>
                {refill.title}
              </option>
            ))
          ) : (
            <option value="none">No Refills</option>
          )}
        </Form.Select>
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
      <Button variant="secondary" onClick={() => hide()}>
        Close
      </Button>
      <Button variant="primary" onClick={handleSubmit((data) => resolve(data))}>
        Save Changes
      </Button>
    </Form>
  );
};

export default PlansModelForm;
