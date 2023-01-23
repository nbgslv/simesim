import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { Post } from '@prisma/client';
import { useInView } from 'react-intersection-observer';
import MainLayout from '../../components/Layouts/MainLayout';
import PostCard from '../../components/Blog/PostCard';
import prisma from '../../lib/prisma';
import styles from '../../styles/blog.module.scss';
import useInfiniteScroll from '../../utils/api/pagination/useInfiniteScroll';

const POST_QUANTITY = 8;

const Index = () => {
  const { ref, inView } = useInView();

  const {
    loading,
    items: postItems,
    loadMore,
    hasNext,
  } = useInfiniteScroll<Post>({
    getItems: async (cursor, limit) => {
      const res = await fetch(
        `/api/blog?cursor=${cursor}&limit=${limit}&order=createdAt&direction=desc`
      );
      const { data: newItems, total } = await res.json();
      return {
        items: newItems,
        total,
      };
    },
    limit: POST_QUANTITY,
  });

  useEffect(() => {
    if (inView && hasNext) {
      loadMore();
    }
  }, [inView, hasNext]);

  return (
    <MainLayout title="בלוג" hideJumbotron>
      <div className={styles.main}>
        <h1 className="mb-5">הבלוג</h1>
        <Container>
          <Row>
            {postItems.map((post) => (
              <Col md={3} key={post.id} className="mb-5">
                <PostCard post={post} />
              </Col>
            ))}
            {loading && (
              <Row>
                <Col className="w-100 h-100 text-center">
                  <Spinner animation={'border'} />
                </Col>
              </Row>
            )}
            <div ref={ref} style={{ visibility: 'hidden' }} />
          </Row>
        </Container>
      </div>
    </MainLayout>
  );
};

export const getStaticProps = async () => {
  const totalPosts = await prisma.post.count({
    where: {
      show: true,
    },
  });

  const posts = await prisma.post.findMany({
    take: POST_QUANTITY,
    where: {
      show: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
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
  const cursor = posts[posts.length - 1]?.id;

  return {
    props: {
      posts: serializedPosts,
      cursor: cursor || null,
      total: totalPosts,
    },
  };
};
export default Index;
