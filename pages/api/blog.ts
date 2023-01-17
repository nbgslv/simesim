import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry, Prisma } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import * as fs from 'fs';

import formidable, {
  Fields,
  Files,
  FormidableError,
  // @ts-ignore
} from 'formidable-serverless';
import cuid from 'cuid';
import { format } from 'date-fns';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<Inquiry> | Prisma.BatchPayload>>
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'POST') {
      if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

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
      const form = new formidable.IncomingForm();
      form.keepExtensions = true;
      form.parse(
        req,
        async (err: FormidableError, fields: Fields, files: Files) => {
          try {
            if (err) {
              throw new Error('Error parsing form');
            }
            const postSchema = yup.object().shape({
              title: yup.string().required('Title is required'),
              slug: yup
                .string()
                .matches(/[a-zA-Z-_]/g)
                .required('Slug is required'),
              coverImage: yup.mixed().required('Cover image is required'),
              content: yup.string().required('Content is required'),
            });
            await postSchema.validate({
              ...fields,
              coverImage: files.coverImage,
            });

            const file = files.coverImage as formidable.File;
            const fileName = `${format(Date.now(), 'yyyy-M-d')}-${
              fields.slug
            }-${cuid()}.${file.name.split('.').pop()}`;
            const bucketParams = {
              Bucket: 'simesim-staging',
              Key: fileName,
              Body: fs.readFileSync(file.path),
              ACL: 'public-read',
            };
            const data = await s3.send(new PutObjectCommand(bucketParams));
            if (data.$metadata.httpStatusCode === 200) {
              // If no error - create new post record
              const newPost = await prisma.post.create({
                data: {
                  title: fields.title,
                  slug: fields.slug,
                  content: fields.content,
                  coverImage: fileName,
                },
              });
              res.status(201).json({ success: true, data: newPost });
            } else {
              throw new Error('Error uploading file');
            }
          } catch (error: unknown) {
            console.error(error);
            res.status(400).json({
              success: false,
              message: (error as Error).message,
              name: 'BLOG_POST_CREATION_ERR',
            });
          }
        }
      );
    } else {
      res.status(405).json({
        name: 'METHOD_NOT_ALLOWED',
        success: false,
        message: 'Method not allowed',
      });
    }
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({
      name: 'CONTACT_CREATION_ERR',
      success: false,
      message: (error as Error).message,
    });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
