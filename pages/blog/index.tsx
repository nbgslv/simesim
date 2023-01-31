import React, { useEffect } from 'react';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { Post } from '@prisma/client';
import { useRouter } from 'next/router';
import MainLayout from '../../components/Layouts/MainLayout';
import PostCard from '../../components/Blog/PostCard';
import styles from '../../styles/blog.module.scss';
import prisma from '../../lib/prisma';
import usePagination from '../../utils/api/pagination/usePagination';
import Pagination from '../../components/Pagination/Pagination';

const POST_QUANTITY = 12;

type BlogProps = {
  initialPosts: Post[];
  total: number;
};

const Index = ({ initialPosts, total }: BlogProps) => {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (initialPosts.length) setPosts(initialPosts);
  }, [initialPosts]);

  const {
    currentItems,
    currentPage,
    goToPage,
    isLoading,
  } = usePagination<Post>({
    apiFetch: async (page, itemsPerPage) => {
      const postsFromApi: Response = await fetch(
        `/api/blog?page=${page}&itemsPerPage=${itemsPerPage}`
      );
      const data = await postsFromApi.json();
      return data.data;
    },
    itemsPerPage: POST_QUANTITY,
  });

  useEffect(() => {
    if (currentItems?.length) setPosts(currentItems);
  }, [currentItems]);

  useEffect(() => {
    if (router.query.page) {
      goToPage(Number(router.query.page));
    }
  }, [router.query.page]);

  useEffect(() => {
    router.push(
      `/blog?page=${currentPage}&itemsPerPage=${POST_QUANTITY}`,
      undefined,
      { shallow: true }
    );
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    router.push(`/blog?page=${page}&itemsPerPage=${POST_QUANTITY}`, undefined, {
      shallow: true,
    });
  };

  return (
    <MainLayout title="בלוג" hideJumbotron>
      <div className={styles.main}>
        <h1 className="mb-5">הבלוג</h1>
        <Container>
          <Row>
            {isLoading ? (
              <Col
                className="w-100 d-flex justify-content-center align-items-center"
                style={{ height: '1058px' }}
              >
                <Spinner animation={'border'} />
              </Col>
            ) : (
              <>
                {posts.map((post) => (
                  <Col md={3} key={post.id} className="mb-5">
                    <PostCard post={post} />
                  </Col>
                ))}
              </>
            )}
          </Row>
          <Row>
            <Col>
              <Pagination
                pages={[...Array(Math.ceil(total / POST_QUANTITY)).keys()]}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </MainLayout>
  );
};

export async function getStaticProps() {
  const total = await prisma.post.count({
    where: {
      show: true,
    },
  });
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    where: {
      show: true,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
    },
    take: POST_QUANTITY,
  });

  return {
    props: {
      initialPosts: posts,
      total,
    },
  };
}

export default Index;
