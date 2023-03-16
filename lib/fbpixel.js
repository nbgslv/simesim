export const pageview = () => {
  window.fbq('track', 'PageView');
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const fbpEvent = (name, options = {}) => {
  window.fbq('track', name, options);
};
