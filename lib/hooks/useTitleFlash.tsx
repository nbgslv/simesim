import { useCallback, useEffect, useRef, useState } from 'react';

const useTitleFlash = (message: string) => {
  const timesFlashed = useRef(0);
  const [title, setTitle] = useState(message);
  const [flash, setFlash] = useState(false);
  const [originalTitle, setOriginalTitle] = useState('');

  useEffect(() => {
    setOriginalTitle(document.title);
  }, []);

  useEffect(() => {
    setTitle(message);
  }, [message]);

  const flashTitle = useCallback(() => {
    if (!document.hidden && flash) {
      document.title = document.title === originalTitle ? title : originalTitle;
      timesFlashed.current += 1;
    } else {
      timesFlashed.current = 0;
    }
  }, [flash]);

  useEffect(() => {
    if (flash && timesFlashed.current === 0) {
      flashTitle();
    }
    return () => {
      document.title = originalTitle;
    };
  }, [flash]);

  return {
    setFlash,
    flash,
  };
};

export default useTitleFlash;
