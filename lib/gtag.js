export const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;

export const pageview = (url) => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    optimize_id: 'OPT-5BHRQR4',
    page_path: url,
  });
};

export const gtagLogin = (userId) => {
  window.gtag('set', { user_id: userId });
  window.gtag('event', 'login', {
    method: 'phone',
  });
}

export const gtagEvent = ({ action, parameters }) => {
  window.gtag('event', action, {
    ...parameters,
  });
};
