import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn:
    SENTRY_DSN ||
    'https://856fdaeeac6f4769a3017ae82a0c8566@o4504344674762752.ingest.sentry.io/4504344675811328',
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 0.1,

  // @ts-ignore
  integrations: [new Sentry.Replay()],
});
