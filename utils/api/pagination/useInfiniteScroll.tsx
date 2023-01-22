import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type UseInfiniteScrollProps<T extends Record<any, any>> = {
  getItems: (
    cursor: string,
    limit: number
  ) => Promise<{
    items: T[];
    total: number;
  }>;
  limit: number;
};

const useInfiniteScroll = <T extends Record<any, any>>({
  getItems,
  limit,
}: UseInfiniteScrollProps<T>) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [cursor, setCursor] = useState('');
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const loadPast = async (lastCursor: string) => {
    try {
      setLoading(true);
      const { items: newItems, total } = await getItems(lastCursor, -limit);
      setItems(newItems);
      setHasNext(total > newItems.length);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.query.cursor && hasNext && !loaded) {
      setCursor(router.query.cursor as string);
      loadPast(router.query.cursor as string);
    }
    setLoaded(true);
  }, [router.query.cursor]);

  const loadMore = async () => {
    try {
      if (loaded && !loading && hasNext) {
        setLoading(true);
        const { items: newItems, total } = await getItems(cursor, limit);
        setItems((prevItems) => [...prevItems, ...newItems]);
        setCursor(newItems[newItems.length - 1].id);
        setHasNext(total > items.length + limit);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    router.replace({
      pathname: router.pathname,
      query: {
        cursor,
      },
    });
  }, [cursor]);

  return {
    items,
    loading,
    loadMore,
    hasNext,
  };
};

export default useInfiniteScroll;
