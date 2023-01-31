import React, { memo } from 'react';
import { motion } from 'framer-motion';
import styles from './Pagination.module.scss';

type PaginationProps = {
  pages: number[];
  currentPage: number;
  handlePageChange: (page: number) => void;
};

const Pagination = memo(
  ({ pages, currentPage, handlePageChange }: PaginationProps) => (
    <div className="d-flex align-items-center justify-content-center flex-row-reverse">
      {pages.map((page) => (
        <motion.button
          whileHover={{ scale: page + 1 !== currentPage ? 1.1 : 1 }}
          whileTap={{ scale: page + 1 !== currentPage ? 0.9 : 1 }}
          key={page}
          disabled={page + 1 === currentPage}
          className={`${styles.pageButton} ${
            page + 1 === currentPage ? styles.active : ''
          }`}
          onClick={() => handlePageChange(page + 1)}
          aria-label={`Go to page ${page}`}
        >
          {page + 1}
        </motion.button>
      ))}
    </div>
  )
);

Pagination.displayName = 'Pagination';

export default Pagination;
