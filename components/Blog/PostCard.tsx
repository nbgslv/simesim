import React from 'react';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Post } from '@prisma/client';
import styles from './PostCard.module.scss';

const PostCard = ({ post }: { post: Post }) => {
  const router = useRouter();

  return (
    <motion.div
      role="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push(`/blog/${post.slug}`)}
    >
      <Card className={styles.main}>
        <Card.Img
          alt={post.title}
          className={styles.coverImage}
          variant="top"
          src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${post.coverImage}`}
        />
        <Card.Body>
          <Card.Title className={styles.title}>{post.title}</Card.Title>
          <Card.Text className={styles.description}>
            {post.description}...
          </Card.Text>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default PostCard;
