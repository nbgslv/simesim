import { useState, useEffect } from 'react';

const useIdle = (time = 3000) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const resetTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setIsIdle(true);
      }, time);
    };

    const clearIdle = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        setIsIdle(false);
        resetTimeout();
      }
    };

    document.addEventListener('mousemove', clearIdle);
    document.addEventListener('keypress', clearIdle);
    document.addEventListener('scroll', clearIdle);

    resetTimeout();

    return () => {
      document.removeEventListener('mousemove', clearIdle);
      document.removeEventListener('keypress', clearIdle);
      document.removeEventListener('scroll', clearIdle);
      clearTimeout(timeoutId as NodeJS.Timeout);
    };
  }, [time]);

  return isIdle;
};

export default useIdle;
