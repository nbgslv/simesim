import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AddBlogPost from '../../components/Offcanvas/Blog/AddBlogPost';

const Blog = () => {
  const [showAddPost, setShowAddPost] = useState(false);

  return (
    <AdminLayout title="Blog">
      <Button onClick={() => setShowAddPost(true)}>Add Post</Button>
      <AddBlogPost show={showAddPost} onHide={() => setShowAddPost(false)} />
    </AdminLayout>
  );
};

export default Blog;
