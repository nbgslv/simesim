import React from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AdminOffcanvas from '../AdminOffcanvas';

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  slug: yup
    .string()
    .matches(/[a-zA-Z-_]/g)
    .required('Slug is required'),
  coverImage: yup.mixed().required('Cover image is required'),
  content: yup.string().required('Content is required'),
});

const BlogEditor = dynamic(() => import('../../Blog/Editor/Editor'), {
  ssr: false,
});

const AddBlogPost = ({
  show,
  onHide,
}: {
  show: boolean;
  onHide: () => void;
}) => {
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
      content: '',
      slug: '',
      coverImage: '',
    },
  });

  const handleAddPost = async (data: any) => {
    const body = new FormData();
    body.append('title', data.title);
    body.append('slug', data.slug);
    body.append('content', data.content);
    body.append('coverImage', data.coverImage[0]);
    await fetch('/api/blog', {
      method: 'POST',
      body,
    });
    // const json = await res.json();
  };

  return (
    <AdminOffcanvas show={show} title="Add Post" onHide={() => onHide()}>
      <div className="mb-3">
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
      </div>
      <Button onClick={handleSubmit((data) => handleAddPost(data))}>
        Save
      </Button>
    </AdminOffcanvas>
  );
};

export default AddBlogPost;
