import React from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useModal } from '@ebay/nice-modal-react';
import styles from './UsersForm.module.scss';

const schema = yup.object().shape({
  email: yup
    .string()
    .length(10, 'Phone Number must be 10 characters')
    .required('Phone Number required'),
  emailEmail: yup.string().email().required('Email required'),
  firstName: yup.string().required('First Name required'),
  lastName: yup.string().required('Last Name required'),
  role: yup.string().oneOf(['ADMIN', 'USER']).required('Role required'),
});

const UsersForm = ({ loading }: { loading: boolean }) => {
  const { resolve, hide } = useModal('add-users');
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      emailEmail: '',
      firstName: '',
      lastName: '',
      role: 'USER',
    },
  });

  return (
    <Form>
      <Form.Group>
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Phone Number"
          {...register('email')}
          isInvalid={!!errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Email"
          {...register('emailEmail')}
          isInvalid={!!errors.emailEmail}
        />
        <Form.Control.Feedback type="invalid">
          {errors.emailEmail?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>First Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter First Name"
          {...register('firstName')}
          isInvalid={!!errors.firstName}
        />
        <Form.Control.Feedback type="invalid">
          {errors.firstName?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Last Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter Last Name"
          {...register('lastName')}
          isInvalid={!!errors.lastName}
        />
        <Form.Control.Feedback type="invalid">
          {errors.lastName?.message}
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

export default UsersForm;
