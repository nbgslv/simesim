import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import imageThumbnail from 'image-thumbnail';
import { format } from 'date-fns';
import fs from 'fs';
import cuid from 'cuid';
import prisma from '../../lib/prisma';
import inngest from './client';

export default inngest.createFunction(
  { name: 'Upload blog images to Digitalocean' },
  { event: 'blog.upload' }, // The event(s) that will trigger this function

  // This function will be called every time an event payload is received
  async ({ event }) => {
    const fileCode = cuid();
    const fileName = `${format(Date.now(), 'yyyy-M-d')}-${
      event.data.slug
    }-${fileCode}.${event.data.file.name.split('.').pop()}`;
    // Upload to digital ocean spaces
    const s3 = new S3({
      forcePathStyle: false, // Configures to use subdomain/virtual calling format.
      endpoint: process.env.DO_SPACE_ENDPOINT,
      region: 'fra1',
      credentials: {
        accessKeyId: process.env.DO_SPACE_KEY as string,
        secretAccessKey: process.env.DO_SPACE_SECRET as string,
      },
    });
    const bucketParams = {
      Bucket: 'simesim-staging',
      Key: fileName,
      Body: fs.readFileSync(event.data.file.path),
      ACL: 'public-read',
    };
    const data = await s3.send(new PutObjectCommand(bucketParams));
    if (data.$metadata.httpStatusCode === 200) {
      // If no error - create new post record

      // Create image thumbnail
      const coverImageThumbnail = await imageThumbnail(event.data.file.path);
      const thumbnailFileName = `${format(Date.now(), 'yyyy-M-d')}-${
        event.data.slug
      }-${fileCode}-thumbnail.${event.data.file.name.split('.').pop()}`;

      const thumbnailBucketParams = {
        Bucket: 'simesim-staging',
        Key: thumbnailFileName,
        Body: coverImageThumbnail,
        ACL: 'public-read',
      };

      await s3.send(new PutObjectCommand(thumbnailBucketParams));

      await prisma.post.update({
        where: {
          slug: event.data.slug,
        },
        data: {
          coverImage: fileName,
          thumbnail: thumbnailFileName,
        },
      });
    } else {
      throw new Error('Error uploading file');
    }
  }
);
