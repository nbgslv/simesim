import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import sanitizeHtml from 'sanitize-html';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Post } from '@prisma/client';
import styles from './PostCard.module.scss';

const PostCard = ({ post }: { post: Post }) => {
  const [description, setDescription] = React.useState('');
  const router = useRouter();

  useEffect(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizeHtml(post.content);
    const text = tempDiv.textContent || tempDiv.innerText || '';
    setDescription(text.split(' ').slice(0, 20).join(' '));
  }, [post.content]);

  return (
    <motion.div
      role="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push(`/blog/${post.slug}`)}
    >
      <Card className={styles.main}>
        <Card.Img
          className={styles.coverImage}
          variant="top"
          src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${post.coverImage}`}
        />
        <Card.Body>
          <Card.Title className={styles.title}>{post.title}</Card.Title>
          <Card.Text>{description}...</Card.Text>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default PostCard;
