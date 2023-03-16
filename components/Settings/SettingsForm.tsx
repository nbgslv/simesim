import React from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './SettingsForm.module.scss';

const schema = yup.object().shape({
  name: yup
    .string()
    .matches(/^[a-zA-Z0-9_]+$/, 'Name must be alphanumeric')
    .required('Name is required'),
  value: yup.string().required('Value is required'),
});

const SettingsForm = ({ loading }: { loading: boolean }) => {
  const { resolve, hide } = useModal('add-settings');
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
      value: '',
    },
  });

  return (
    <Form>
      <Form.Group>
        <Form.Label>Setting Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Name"
          {...register('name')}
          isInvalid={!!errors.name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Setting Value</Form.Label>
        <Form.Control
          type="text"
          placeholder="Value"
          {...register('value')}
          isInvalid={!!errors.value}
        />
        <Form.Control.Feedback type="invalid">
          {errors.value?.message}
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
        {loading ? <Spinner animation="border" size="sm" /> : 'Create'}
      </Button>
    </Form>
  );
};

export default SettingsForm;
