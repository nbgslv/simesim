import React from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AdminOffcanvas from '../AdminOffcanvas';

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
    // resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      slug: '',
      coverImage: '',
    },
  });
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
        </Form.Group>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Cover Image</Form.Label>
          <Form.Control type="file" {...register('coverImage')} />
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
          </Col>
        </Row>
      </div>

      <Button>Save</Button>
    </AdminOffcanvas>
  );
};

export default AddBlogPost;
