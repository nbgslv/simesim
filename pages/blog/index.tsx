import React, { useEffect } from 'react';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import { Post } from '@prisma/client';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
    if (router.query.page) {
      goToPage(Number(router.query.page));
      if (router.query.page === '1' && initialPosts.length > 0) {
        setPosts(initialPosts);
      } else {
        setPosts(currentItems);
      }
    } else {
      setPosts(initialPosts);
      router.push(`/blog?page=1&itemsPerPage=${POST_QUANTITY}`, undefined, {
        shallow: true,
      });
    }
  }, [initialPosts, currentItems, router.query.page]);

  return (
    <MainLayout title="בלוג" hideJumbotron>
      <Head>
        <link
          rel="canonical"
          href={`${process.env.NEXT_PUBLIC_BASE_URL}/blog`}
        />
      </Head>
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
                setUrl={(page) =>
                  `/blog?page=${page}&itemsPerPage=${POST_QUANTITY}`
                }
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
