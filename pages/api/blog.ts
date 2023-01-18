import type { NextApiRequest, NextApiResponse } from 'next';
import { Inquiry, Post, Prisma } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';

import formidable, {
  Fields,
  Files,
  FormidableError,
  // @ts-ignore
} from 'formidable-serverless';
import cuid from 'cuid';
import { format } from 'date-fns';
import { Readable } from 'stream';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';
import { Input } from '../../utils/api/services/adminApi';
import { deleteSchema } from '../../utils/api/validation';

async function buffer(readable: Readable) {
  const chunks = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

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
              coverImage: yup
                .mixed()
                .required('Cover image is required')
                .test('filesNumber', 'Only one file', (value) => {
                  if (value) {
                    if (Array.isArray(value)) {
                      return value.length === 1;
                    }
                    return true;
                  }
                  return false;
                }),
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
    } else if (method === 'PUT') {
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const buf = await buffer(req);
      const rawBody = buf.toString('utf8');
      const body = JSON.parse(rawBody);
      const { input }: { input: Input<Post, 'update'> } = body;
      const putSchema = yup.object({
        input: yup
          .object({
            where: yup
              .object({
                id: yup.string().required(),
              })
              .required(),
            data: yup
              .object({
                title: yup.string(),
                slug: yup
                  .string()
                  .optional()
                  .matches(/[a-zA-Z-_]/g),
                coverImage: yup
                  .mixed()
                  .optional()
                  .test(
                    'filesNumber',
                    'Only one file',
                    (value?: Array<File> | string) => {
                      if (value) {
                        if (typeof value === 'string') {
                          return true;
                        }
                        if (Array.isArray(value)) {
                          return value.length === 1;
                        }
                      }
                      return true;
                    }
                  ),
                content: yup.string(),
              })
              .required(),
            include: yup.object(),
          })
          .required(),
      });
      // TODO add replace file option
      await putSchema.validate({ input });
      const update: Post = await prisma.post.update(({
        ...input,
      } as unknown) as Prisma.PostUpdateArgs);
      res.status(200).json({ success: true, data: update });
    } else if (method === 'DELETE') {
      const s3 = new S3({
        forcePathStyle: false, // Configures to use subdomain/virtual calling format.
        endpoint: process.env.DO_SPACE_ENDPOINT,
        region: 'fra1',
        credentials: {
          accessKeyId: process.env.DO_SPACE_KEY as string,
          secretAccessKey: process.env.DO_SPACE_SECRET as string,
        },
      });
      if (!session || session.user.role !== 'ADMIN') {
        res.status(401).json({
          name: 'UNAUTHORIZED',
          success: false,
          message: 'Unauthorized',
        });
        return;
      }
      const buf = await buffer(req);
      const rawBody = buf.toString('utf8');
      const body = JSON.parse(rawBody);
      const { action, input } = body;
      await deleteSchema.validate({ action, input });
      if (action === 'deleteMany') {
        const posts = await prisma.post.findMany({
          where: {
            id: {
              in: input.where.id.in,
            },
          },
        });
        const deleteKeys = posts.map((post) => ({
          Key: post.coverImage,
        }));
        const deleteParams = {
          Bucket: 'simesim-staging',
          Delete: {
            Objects: deleteKeys,
          },
        };
        const data = await s3.send(new DeleteObjectsCommand(deleteParams));
        if (data.$metadata.httpStatusCode === 200) {
          const deleteMany: Prisma.BatchPayload = await prisma.post.deleteMany({
            ...input,
          });
          res.status(200).json({ success: true, data: deleteMany });
        } else {
          throw new Error('Error deleting files');
        }
      } else if (action === 'delete') {
        const post = await prisma.post.findUnique({
          where: {
            id: input.where.id,
          },
        });
        const bucketParams = {
          Bucket: 'simesim-staging',
          Key: post?.coverImage,
        };
        const data = await s3.send(new DeleteObjectCommand(bucketParams));
        if (data.$metadata.httpStatusCode === 204) {
          const deleteOne: Post = await prisma.post.delete({
            ...input,
          });
          res.status(200).json({ success: true, data: deleteOne });
        } else {
          throw new Error('Error deleting file');
        }
      }
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
