import React from 'react';

type UsePaginationProps = {
  model: 'blog';
  steps: number;
  firstCursor: string;
  total: number;
};
const usePagination = <T extends Record<string, any>>({
  model,
  steps,
  firstCursor,
  total,
}: UsePaginationProps) => {
  const [totalNow, setTotalNow] = React.useState<number>(steps);
  const [cursor, setCursor] = React.useState<string>(firstCursor);
  const [error, setError] = React.useState<boolean>(false);
  const [items, setItems] = React.useState<T[]>([]);
  const [totalItems, setTotalItems] = React.useState<number>(total);
  const [loading, setLoading] = React.useState<boolean>(false);

  const loadMore = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/${model}?limit=${steps}&cursor=${cursor}&order=createdAt&direction=desc`
      );
      const { data, success } = await res.json();
      if (!success) {
        throw new Error('Error loading more posts');
      }
      setTotalNow(totalNow + data.posts.length);
      setItems([...items, ...data.posts]);
      setCursor(data.posts[data.posts.length - 1].id);
      setTotalItems(data.total);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    hasNextPage: totalItems > totalNow,
    error,
    loadMore,
  };
};

export default usePagination;
