import React from 'react';
import { Post } from '@prisma/client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import styles from './YouMightAlsoLike.module.scss';

const YouMightAlsoLike = ({ posts }: { posts: Post[] }) => {
  const router = useRouter();

  return (
    <div className="mt-5">
      <h2 className="mb-4">ציפור לחשה לנו שאולי תתעניין גם באלה...</h2>
      <div className="w-100 d-flex justify-content-between">
        {posts.map((post) => (
          <motion.div
            className={styles.container}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="button"
            key={post.id}
            onClick={() => router.push(`/blog/${post.slug}`)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.title}
              src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${post.coverImage}`}
              className={styles.coverImage}
            />
            <div>{post.title}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default YouMightAlsoLike;
