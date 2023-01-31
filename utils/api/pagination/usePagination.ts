import { useState, useEffect } from 'react';

export type PaginationApiResponse<T extends Record<any, any>> = {
  total: number;
  items: T[];
};

type PaginationProps<T extends Record<any, any>> = {
  apiFetch: (
    page: number,
    itemsPerPage: number
  ) => Promise<PaginationApiResponse<T>>;
  itemsPerPage: number;
};

function usePagination<T extends Record<any, any>>({
  apiFetch,
  itemsPerPage,
}: PaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [currentItems, setCurrentItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setCurrentItems([]);
        const { total, items } = await apiFetch(currentPage, itemsPerPage);
        setTotalPages(Math.ceil(total / itemsPerPage));
        setCurrentItems(items);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [currentPage, itemsPerPage]);

  function goToPage(page: number) {
    if (totalPages > 0 && (page > totalPages || page < 1)) {
      return;
    }
    setCurrentPage(page);
  }

  return {
    currentItems,
    currentPage,
    goToPage,
    totalPages,
    isLoading,
    error,
  };
}

export default usePagination;
