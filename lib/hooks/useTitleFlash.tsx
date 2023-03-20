import { useEffect, useState } from 'react';

function useFlashTitle(title: string) {
  const [count, setCount] = useState(0);
  const [originalTitle, setOriginalTitle] = useState('');
  const [flash, setFlash] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setOriginalTitle(document.title);
  }, []);

  useEffect(() => {
    setIntervalId(
      setInterval(() => {
        setCount((lastCount) => lastCount + 1);
      }, 1000)
    );

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (flash && originalTitle) {
      document.title = count % 2 === 0 ? title : originalTitle;
    } else {
      document.title = originalTitle;
      clearInterval(intervalId as NodeJS.Timeout);
    }
  }, [count, title]);

  return { setFlash, flash };
}

export default useFlashTitle;
