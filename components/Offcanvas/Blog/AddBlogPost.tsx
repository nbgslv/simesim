import React from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useModal } from '@ebay/nice-modal-react';
import styles from '../../Coupons/CouponsForm.module.scss';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  slug: yup
    .string()
    .matches(/[a-zA-Z-_]/g)
    .required('Slug is required'),
  coverImage: yup
    .mixed()
    .test('required', 'Cover image is required', (value) => {
      if (value) {
        return value[0];
      }
      return false;
    })
    .test('filesNumber', 'Only one file', (value) => {
      if (value) {
        return value.length === 1;
      }
      return false;
    }),
  description: yup.string().required('Description is required'),
  content: yup.string().required('Content is required'),
});

const BlogEditor = dynamic(() => import('../../Blog/Editor/Editor'), {
  ssr: false,
});

const AddBlogPost = ({ loading }: { loading: boolean }) => {
  const { resolve, hide } = useModal('add-posts');
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
  } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      slug: '',
      coverImage: '',
    },
  });

  return (
    <Form>
      <Form.Group>
        <Form.Label>Title</Form.Label>
        <Form.Control
          {...register('title')}
          type="text"
          isInvalid={!!errors.title}
        />
        <Form.Control.Feedback type="invalid">
          {errors.title?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Slug</Form.Label>
        <Form.Control
          {...register('slug')}
          type="text"
          isInvalid={!!errors.slug}
        />
        <Form.Control.Feedback type="invalid">
          {errors.slug?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Label>Cover Image</Form.Label>
        <Form.Control type="file" {...register('coverImage')} />
        <Form.Control.Feedback type="invalid">
          {errors.coverImage?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group>
        <Form.Label>Description</Form.Label>
        <Form.Control
          {...register('description')}
          type="textarea"
          isInvalid={!!errors.description}
        />
        <Form.Control.Feedback type="invalid">
          {errors.description?.message}
        </Form.Control.Feedback>
      </Form.Group>
      <Row>
        <Col>Post Content</Col>
      </Row>
      <Row>
        <Col>
          <Controller
            name="content"
            control={control}
            render={({ field }) => <BlogEditor onChange={field.onChange} />}
          />
          <Form.Control.Feedback type="invalid">
            {errors.content?.message}
          </Form.Control.Feedback>
        </Col>
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
        {loading ? (
          <Spinner animation="border" size="sm" style={{ color: '#ffffff' }} />
        ) : (
          'Save Changes'
        )}
      </Button>
    </Form>
  );
};

export default AddBlogPost;
