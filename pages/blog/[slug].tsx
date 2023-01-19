import React from 'react';
import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import { Post } from '@prisma/client';
import { Col, Container, Row } from 'react-bootstrap';
import sanitizeHtml from 'sanitize-html';
import prisma from '../../lib/prisma';
import MainLayout from '../../components/Layouts/MainLayout';
import styles from '../../styles/slug.module.scss';
import YouMightAlsoLike from '../../components/Blog/YouMightAlsoLike';
import ShareButton from '../../components/Blog/ShareButton/ShareButton';

const Slug = ({
  post,
  morePosts,
}: {
  post: Post;
  morePosts: Post[] | null;
}) => (
  <MainLayout title={post.title} hideJumbotron>
    <div className={styles.main}>
      <Container>
        <Row>
          <Col className={styles.title}>
            <h1>{post.title}</h1>
          </Col>
        </Row>
        <Row>
          <Col className="d-flex align-items-start">
            <ShareButton
              url={`${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post.slug}`}
              title={post.title}
            />
          </Col>
          <Col className={styles.date}>
            {(post.createdAt as unknown) as string}
          </Col>
        </Row>
        <Row className="mb-3 mt-3">
          <Col className={styles.coverImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.title}
              src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${post.coverImage}`}
              className={styles.coverImage}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{
                __html: sanitizeHtml(post.content, {
                  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                    'img',
                  ]),
                  allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat([
                    'data',
                  ]),
                }),
              }}
            />
          </Col>
        </Row>
        {morePosts?.length ? (
          <Row>
            <Col>
              <YouMightAlsoLike posts={morePosts} />
            </Col>
          </Row>
        ) : null}
      </Container>
    </div>
  </MainLayout>
);

export const getStaticProps: GetStaticProps<
  {
    post: Omit<
      Post,
      'id' | 'updatedAt' | 'createdAt' | 'show' | 'views'
    > | null;
    morePosts:
      | Omit<Post, 'id' | 'updatedAt' | 'createdAt' | 'show' | 'views'>[]
      | null;
  },
  { slug: string }
> = async (context) => {
  const { slug } = context.params!;
  const post = await prisma.post.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      coverImage: true,
      createdAt: true,
    },
  });

  await prisma.post.update({
    where: {
      slug,
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  const morePosts = await prisma.post.findMany({
    orderBy: {
      views: 'desc',
    },
    where: {
      id: {
        not: post?.id,
      },
    },
    select: {
      slug: true,
      title: true,
      content: true,
      coverImage: true,
      createdAt: true,
    },
    take: 3,
  });

  if (!post) {
    return { props: { post: null, morePosts: null } };
  }

  const serializedPost = {
    ...post,
    createdAt: format(post?.createdAt, 'dd/MM/yy kk:mm'),
  };

  const serializedMorePosts = morePosts.map((postOfPosts) => ({
    ...postOfPosts,
    createdAt: format(postOfPosts?.createdAt, 'dd/MM/yy kk:mm'),
  }));

  return {
    props: {
      post: serializedPost,
      morePosts: serializedMorePosts,
    },
  };
};

export async function getStaticPaths() {
  const posts = await prisma.post.findMany({
    select: {
      slug: true,
    },
  });
  const paths = posts.map((post) => ({
    params: { slug: post.slug },
  }));
  return { paths, fallback: false };
}
export default Slug;
