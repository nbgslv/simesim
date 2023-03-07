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

type Events = {
  'blog.upload': UploadBlogImagesToDigitalocean;
};

const inngest = new Inngest<Events>({ name: 'simesim' });

export default inngest;
