import React from 'react';
import { Post } from '@prisma/client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './YouMightAlsoLike.module.scss';

const YouMightAlsoLike = ({ posts }: { posts: Post[] }) => (
  <div className="mt-5">
    <h2 className="mb-4">ציפור לחשה לנו שאולי תתעניין גם באלה...</h2>
    <div className="w-100 d-flex justify-content-between">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} passHref legacyBehavior>
          <motion.div
            className={styles.container}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            role="button"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={post.title}
              src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${post.coverImage}`}
              className={styles.coverImage}
            />
            <div className={styles.postTitle}>{post.title}</div>
          </motion.div>
        </Link>
      ))}
    </div>
  </div>
);

export default YouMightAlsoLike;
