import { Inngest } from 'inngest';
// @ts-ignore
import formidable from 'formidable-serverless';

type UploadBlogImagesToDigitalocean = {
  name: 'blog.upload';
  data: {
    file: formidable.File;
    slug: string;
  };
};

type SyncCountries = {
  name: 'countries.sync';
  data: {};
};

type Events = {
  'blog.upload': UploadBlogImagesToDigitalocean;
  'countries.sync': SyncCountries;
};

const inngest = new Inngest<Events>({ name: 'simesim' });

export default inngest;
