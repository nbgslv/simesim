import React from 'react';
import { Post } from '@prisma/client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './YouMightAlsoLike.module.scss';

const YouMightAlsoLike = ({ posts }: { posts: Post[] }) => (
  <div>
    <h2 className="mb-4">ציפור לחשה לנו שאולי תתעניין גם באלה...</h2>
    <div className="w-100 d-flex justify-content-between">
      {posts.map((post) => (
        <motion.div
          className={styles.container}
          whileHover={{ scale: '1.05' }}
          whileTap={{ scale: '.95' }}
          role="button"
          key={post.id}
        >
          <Image
            alt={post.title}
            src={`${process.env.NEXT_PUBLIC_DO_SPACE_URL}/${post.coverImage}`}
            width={100}
            height={100}
          />
          <div>{post.title}</div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default YouMightAlsoLike;
