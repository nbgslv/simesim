import React from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import styles from './CountriesForm.module.scss';

const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .matches(/^[A-Za-z]+$/, 'Name must be only english letters'),
  translation: yup
    .string()
    .required('Translation is required')
    .matches(/^[\u0590-\u05fe]+$/, 'Translation must be only hebrew letters'),
  lockTranslation: yup.boolean(),
  show: yup.boolean(),
});

const CountriesForm = ({ loading = false }: { loading: boolean }) => {
  const { resolve, hide } = useModal('add-country');
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      translation: '',
      lockTranslation: false,
      show: true,
    },
  });

  return (
    <Form>
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
        <Form.Label>Translation</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Translation"
          {...register('translation')}
          isInvalid={!!errors.translation}
        />
        <Form.Control.Feedback type="invalid">
          {errors.translation?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Check
          type="switch"
          id="lock-translation"
          label="Lock Translation"
          {...register('lockTranslation')}
          isInvalid={!!errors.lockTranslation}
        />
        <Form.Control.Feedback type="invalid">
          {errors.lockTranslation?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Check
          type="switch"
          id="show-country"
          label="Show"
          {...register('show')}
          isInvalid={!!errors.show}
        />
        <Form.Control.Feedback type="invalid">
          {errors.show?.message}
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

export default CountriesForm;
