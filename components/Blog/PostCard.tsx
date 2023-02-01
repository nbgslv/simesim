import React from 'react';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Post } from '@prisma/client';
import Link from 'next/link';
import styles from './PostCard.module.scss';

const PostCard = ({ post }: { post: Post }) => (
  <Link href={`/blog/${post.slug}`} passHref legacyBehavior>
    <a className={styles.cardLink}>
      <motion.div
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
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
    </a>
  </Link>
);

export default PostCard;
