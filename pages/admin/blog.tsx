import React from 'react';
import { Button } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import AdminLayout from '../../components/Layouts/AdminLayout';
import AdminOffcanvas from '../../components/Offcanvas/AdminOffcanvas';

const DynamicEditor = dynamic(
  () =>
    import('../../components/Blog/Editor/Editor').then((mod) => mod.default),
  { ssr: false }
);
const Blog = () => {
  const [showAddPost, setShowAddPost] = React.useState(false);
  return (
    <AdminLayout title="Blog">
      <Button onClick={() => setShowAddPost(true)}>Add Post</Button>
      <AdminOffcanvas
        show={showAddPost}
        title="Add Post"
        onHide={() => setShowAddPost(false)}
      >
        <DynamicEditor />
      </AdminOffcanvas>
    </AdminLayout>
  );
};

export default Blog;
