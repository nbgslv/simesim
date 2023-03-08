import { serve } from 'inngest/next';
import blogUpload from '../../utils/inngest/blog';
import countriesSync from '../../utils/inngest/countries';

export default serve(
  'simesim',
  [blogUpload, countriesSync], // A list of functions to expose.  This can be empty to start.
  {
    signingKey: process.env.INNGEST_SIGNING_KEY,
  }
);
