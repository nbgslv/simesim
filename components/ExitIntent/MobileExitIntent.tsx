import { useEffect, useState } from 'react';

type UseMobileExitIntentProps = {
  callback: () => void;
  options?: {
    percentDown?: number;
    percentUp?: number;
    scrollInterval?: number;
  };
};

function useMobileExitIntent({ callback, options }: UseMobileExitIntentProps) {
  const defaults = {
    percentDown: 40,
    percentUp: 10,
    scrollInterval: 1000,
  };

  const mergedOptions = { ...defaults, ...options };
  const { percentDown, percentUp, scrollInterval } = mergedOptions;
  const [complete, setComplete] = useState(false);
  const [scrollStart, setScrollStart] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timer;
    let lowestScrollPosition = 0;
    function handleExitIntent(e: MouseEvent) {
      if (!complete && e.clientY < 0) {
        callback();
        setComplete(true);
        document.removeEventListener('mouseleave', handleExitIntent);
      }
    }

    function handleScrollDown() {
      const pageHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const downScrollPercent = window.scrollY / pageHeight;

      if (downScrollPercent > percentDown / 100) {
        lowestScrollPosition = downScrollPercent;
        clearInterval(interval);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        interval = setInterval(handleScrollUp, scrollInterval);
      }
    }

    function handleScrollUp() {
      const scrollAmount = window.scrollY - scrollStart;
      if (scrollAmount < 0) {
        setScrollStart(window.scrollY);
        return;
      }

      const pageHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const upScrollPercent = (pageHeight - scrollAmount) / pageHeight;

      if (upScrollPercent - lowestScrollPosition > percentUp / 100) {
        clearInterval(interval);
        setComplete(true);
        callback();
      }
    }

    setScrollStart(window.scrollY);
    interval = setInterval(handleScrollDown, scrollInterval);

    return () => {
      document.removeEventListener('mouseleave', handleExitIntent);
      clearInterval(interval);
    };
  }, [
    callback,
    complete,
    mergedOptions,
    percentDown,
    scrollInterval,
    scrollStart,
  ]);

  return complete;
}

export default useMobileExitIntent;
