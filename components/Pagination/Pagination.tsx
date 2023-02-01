import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './Pagination.module.scss';

type PaginationProps = {
  pages: number[];
  currentPage: number;
  setUrl: (page: number) => string;
};

const Pagination = memo(({ pages, currentPage, setUrl }: PaginationProps) => (
  <div className="d-flex align-items-center justify-content-center flex-row-reverse">
    {pages.map((page) => (
      <Link
        key={page}
        href={page + 1 === currentPage ? '' : setUrl(page + 1)}
        passHref
        legacyBehavior
      >
        <motion.a
          whileHover={{ scale: page + 1 !== currentPage ? 1.1 : 1 }}
          whileTap={{ scale: page + 1 !== currentPage ? 0.9 : 1 }}
          aria-disabled={page + 1 === currentPage}
          className={`${styles.pageButton} ${
            page + 1 === currentPage ? styles.active : ''
          }`}
          aria-label={`Go to page ${page}`}
        >
          {page + 1}
        </motion.a>
      </Link>
    ))}
  </div>
));

Pagination.displayName = 'Pagination';

export default Pagination;
