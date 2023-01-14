import React, { useEffect, useState } from 'react';
import { Button, Row } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import dynamic from 'next/dynamic';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminOffcanvas from '../../components/Offcanvas/AdminOffcanvas';
import AddBlogPost from '../../components/Offcanvas/Blog/AddBlogPost';

const Blog = () => {
  const [showAddPost, setShowAddPost] = useState(false);

  return (
    <AdminLayout title="Blog">
      <Button onClick={() => setShowAddPost(true)}>Add Post</Button>
      <AddBlogPost show={showAddPost} />
    </AdminLayout>
  );
};

export default Blog;
