import React from 'react';
import { format } from 'date-fns';
import { Col, Container, Row } from 'react-bootstrap';
import { Post } from '@prisma/client';
import MainLayout from '../../components/Layouts/MainLayout';
import PostCard from '../../components/Blog/PostCard';
import prisma from '../../lib/prisma';
import styles from '../../styles/blog.module.scss';

const Index = ({ posts }: { posts: Post[] }) => (
  <MainLayout title="בלוג" hideJumbotron>
    <div className={styles.main}>
      <h1 className="mb-5">הבלוג</h1>
      <Container>
        <Row>
          {posts.map((post) => (
            <Col md={3} key={post.id} className="mb-5">
              <PostCard post={post} />
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  </MainLayout>
);

export const getStaticProps = async () => {
  const posts = await prisma.post.findMany({
    where: {
      show: true,
    },
    select: {
      slug: true,
      title: true,
      content: true,
      coverImage: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  const serializedPosts = posts.map((post) => ({
    ...post,
    createdAt: format(post.createdAt, 'dd/MM/yy kk:mm'),
  }));

  return {
    props: {
      posts: serializedPosts,
    },
  };
};
export default Index;
