import { useCallback } from 'react';

const useHideRecaptcha = () => {
  const hideRecaptcha = useCallback(() => {
    const recaptcha = Array.from(
      document.getElementsByClassName(
        'grecaptcha-badge'
      ) as HTMLCollectionOf<HTMLElement>
    );
    if (recaptcha.length > 0) {
      recaptcha[0].style.visibility = 'hidden';
    }
  }, []);

  return { hideRecaptcha };
};

export default useHideRecaptcha;
