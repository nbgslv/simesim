import React, { useEffect } from 'react';
import { GetStaticProps } from 'next';
import { Post } from '@prisma/client';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import sanitizeHtml from 'sanitize-html';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import prisma from '../../lib/prisma';
import MainLayout from '../../components/Layouts/MainLayout';
import styles from '../../styles/slug.module.scss';
import YouMightAlsoLike from '../../components/Blog/YouMightAlsoLike';
import ShareButton from '../../components/Blog/ShareButton/ShareButton';

const Slug = ({ postId, morePosts }: { postId: string; morePosts: Post[] }) => {
  const [postLoading, setPostLoading] = React.useState<boolean>(true);
  const [post, setPost] = React.useState<Partial<Post> | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const postData = await fetch(`/api/blog/${postId}`);
        const postDataJson = await postData.json();
        if (!postDataJson.success) {
          throw new Error('Error fetching post');
        }
        setPost(postDataJson.data);
      } catch (error) {
        console.error(error);
        await router.push('/error');
      } finally {
        setPostLoading(false);
      }
    })();
  }, [postId]);

  return (
    <MainLayout title={post?.title || 'טוען...'} hideJumbotron>
      <div className={styles.main}>
        <Container>
          <>
            {postLoading ? (
              <div className="text-center">
                <Spinner animation={'border'} />
              </div>
            ) : (
              <>
                <Row>
                  <Col className={styles.title}>
                    <h1>{post?.title}</h1>
                  </Col>
                </Row>
                <Row>
                  <Col className="d-flex align-items-start">
                    <ShareButton
                      url={`${process.env.NEXT_PUBLIC_BASE_URL}/blog/${post?.slug}`}
                      title={post?.title || ''}
                    />
                  </Col>
                  <Col className={styles.date}>
                    {post?.createdAt
                      ? ((format(
                          new Date(post.createdAt),
                          'dd/MM/yy kk:mm'
                        ) as unknown) as string)
                      : ''}
                  </Col>
                </Row>
                <Row className="mb-3 mt-3">
                  <Col className={styles.coverImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={post?.title}
                      src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${post?.coverImage}`}
                      className={styles.coverImage}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div
                      className={styles.content}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(post?.content || '', {
                          allowedTags: sanitizeHtml.defaults.allowedTags.concat(
                            ['img']
                          ),
                          allowedAttributes: {
                            img: ['src', 'style'],
                          },
                          allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(
                            ['data']
                          ),
                        }),
                      }}
                    />
                  </Col>
                </Row>
                {morePosts?.length ? (
                  <Row className="w-100 text-center">
                    <Col>
                      <YouMightAlsoLike posts={morePosts} />
                    </Col>
                  </Row>
                ) : null}
              </>
            )}
          </>
        </Container>
      </div>
    </MainLayout>
  );
};

export const getStaticProps: GetStaticProps<
  {
    postId: string | null;
    morePosts?: Partial<Post>[] | null;
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
      id: true,
      slug: true,
      title: true,
      description: true,
      coverImage: true,
    },
    take: 3,
  });

  if (!post || !morePosts) {
    return { props: { postId: null, morePostsIds: null } };
  }

  return {
    props: {
      postId: post.id,
      morePosts,
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
