import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { Post } from '@prisma/client';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import MainLayout from '../../components/Layouts/MainLayout';
import PostCard from '../../components/Blog/PostCard';
import prisma from '../../lib/prisma';
import styles from '../../styles/blog.module.scss';
import usePagination from '../../utils/api/pagination/usePagination';

const POST_QUANTITY = 4;

const Index = ({
  posts,
  cursor,
  total,
}: {
  posts: Post[];
  cursor: string;
  total: number;
}) => {
  const [postItems, setPostItems] = React.useState<Post[]>(posts);

  const { loading, items, hasNextPage, error, loadMore } = usePagination<Post>({
    model: 'blog',
    steps: POST_QUANTITY,
    firstCursor: cursor,
    total,
  });

  useEffect(() => {
    setPostItems([...posts, ...items]);
  }, [items]);

  const [sentryRef] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: error,
  });

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
            {loading || hasNextPage ? (
              <div ref={sentryRef}>
                <Row>
                  <Col className="text-center">
                    <Spinner animation={'border'} />
                  </Col>
                </Row>
              </div>
            ) : null}
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
      cursor,
      total: totalPosts,
    },
  };
};
export default Index;
