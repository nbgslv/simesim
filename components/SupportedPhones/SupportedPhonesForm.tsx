import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import { PhoneBrand } from '@prisma/client';
import styles from './SupportedPhonesForm.module.scss';

const schema = yup.object().shape({
  phoneModel: yup
    .string()
    .required('Name is required')
    .matches(/^[A-Za-z\s0-9]+$/, 'Name must be only english letters'),
  brandId: yup
    .string()
    .not(['none'], 'Brand is required')
    .when(['newBrand'], (newBrand, subSchema) =>
      newBrand ? subSchema : subSchema.required('Brand is required')
    ),
  newBrand: yup.string(),
});

const SupportedPhonesForm = ({
  brands,
  loading = false,
}: {
  brands: PhoneBrand[];
  loading: boolean;
}) => {
  const { resolve, hide } = useModal('add-supported-phone');
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      phoneModel: '',
      brandId: '',
      newBrand: '',
    },
  });
  const [addNewBrand, setAddNewBrand] = useState(false);

  return (
    <Form>
      <Form.Group>
        <Form.Label>Phone Model</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Name"
          {...register('phoneModel')}
          isInvalid={!!errors.phoneModel}
        />
        <Form.Control.Feedback type="invalid">
          {errors.phoneModel?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Brand</Form.Label>
        <Form.Select
          {...register('brandId')}
          disabled={addNewBrand}
          isInvalid={!!errors.brandId}
        >
          {brands.length ? (
            brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))
          ) : (
            <option value="none">No Brands</option>
          )}
        </Form.Select>
        <Form.Check
          type="switch"
          id="new-brand"
          label="Add New Brand"
          checked={addNewBrand}
          onChange={() => setAddNewBrand(!addNewBrand)}
        />
        <Form.Control.Feedback type="invalid">
          {errors.brandId?.message}
        </Form.Control.Feedback>
      </Form.Group>
      {addNewBrand && (
        <Form.Group>
          <Form.Label>New Brand</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Brand Name"
            {...register('newBrand')}
            isInvalid={!!errors.newBrand}
          />
          <Form.Control.Feedback type="invalid">
            {errors.newBrand?.message}
          </Form.Control.Feedback>
        </Form.Group>
      )}
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

export default SupportedPhonesForm;
