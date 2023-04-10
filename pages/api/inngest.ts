import { serve } from 'inngest/next';
import blogUpload from '../../utils/inngest/blog';
import countriesSync from '../../utils/inngest/countries';
import abandonedCarts from '../../utils/inngest/abandonedCarts';
import feedback from '../../utils/inngest/feedback';

export default serve(
  'simesim',
  [blogUpload, countriesSync, abandonedCarts, feedback], // A list of functions to expose.  This can be empty to start.
  {
    signingKey: process.env.INNGEST_SIGNING_KEY,
    landingPage: process.env.NODE_ENV !== 'production',
  }
);
