import { serve } from 'inngest/next';
import blogUpload from '../../utils/inngest/blog';

export default serve(
  'simesim',
  [blogUpload], // A list of functions to expose.  This can be empty to start.
  {
    signingKey: process.env.INNGEST_SIGNING_KEY,
  }
);
