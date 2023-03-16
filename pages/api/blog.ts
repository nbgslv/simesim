import type { NextApiRequest, NextApiResponse } from 'next';
import { Post, Prisma } from '@prisma/client';
import * as yup from 'yup';
import { unstable_getServerSession } from 'next-auth';
import { DeleteObjectsCommand, S3 } from '@aws-sdk/client-s3';
import formidable, {
  Fields,
  Files,
  FormidableError,
  // @ts-ignore
} from 'formidable-serverless';
import { Readable } from 'stream';
import sanitizeHtml from 'sanitize-html';
import DOMParser from 'dom-parser';
import prisma from '../../lib/prisma';
import { ApiResponse } from '../../lib/types/api';
import { authOptions } from './auth/[...nextauth]';
import { Input } from '../../utils/api/services/adminApi';
import { deleteSchema } from '../../utils/api/validation';
import { PaginationApiResponse } from '../../utils/api/pagination/usePagination';
import inngest from '../../utils/inngest/client';

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
  res: NextApiResponse<
    | ApiResponse<
        PaginationApiResponse<Partial<Post>> | Post | Prisma.BatchPayload
      >
    | { data: Post[]; total: number }
  >
) {
  try {
    const session = await unstable_getServerSession(
      req as NextApiRequest,
      res as NextApiResponse,
      authOptions(req as NextApiRequest, res as NextApiResponse)
    );
    const { method } = req;
    if (method === 'GET') {
      const { page, itemsPerPage } = req.query;
      if (!page || !itemsPerPage) {
        return;
      }

      const total = await prisma.post.count({
        where: {
          show: true,
        },
      });

      const posts = await prisma.post.findMany({
        where: {
          show: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(itemsPerPage as string, 10),
        skip:
          (parseInt(page as string, 10) - 1) *
          parseInt(itemsPerPage as string, 10),
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          coverImage: true,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          items: posts,
          total,
        },
      });
    } else if (method === 'POST') {
      if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

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
              description: yup.string().required('Description is required'),
              content: yup.string().required('Content is required'),
            });
            await postSchema.validate({
              ...fields,
              coverImage: files.coverImage,
            });

            const file = files.coverImage as formidable.File;

            // Add style tag to img tags
            const content = fields.content.replace(
              /<img/g,
              '<img style="max-width: 100%; width: 100%; height: auto;"'
            );

            // Create blog description

            const tempDom = new DOMParser();
            const tempDoc = tempDom.parseFromString(content);
            const description =
              tempDoc && tempDoc.getElementsByTagName('p')?.length
                ? sanitizeHtml(
                    // @ts-ignore
                    tempDoc
                      .getElementsByTagName('p')
                      .map((p) => p.innerHTML)
                      .join(' '),
                    {
                      allowedTags: [],
                      allowedAttributes: {},
                    }
                  )
                    .split(' ')
                    .slice(0, 10)
                    .join(' ')
                : null;

            const newPost = await prisma.post.create({
              data: {
                title: fields.title,
                slug: fields.slug,
                description: description ?? undefined,
                content,
              },
            });

            await inngest.send({
              name: 'blog.upload',
              data: {
                file,
                slug: fields.slug,
              },
            });

            res.status(201).json({ success: true, data: newPost });
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
        const deleteKeys = posts.reduce<{ Key: string }[]>((acc, post) => {
          if (post.coverImage && post.thumbnail)
            return [
              ...acc,
              {
                Key: post.coverImage,
              },
              {
                Key: post.thumbnail,
              },
            ];
          return acc;
        }, []);

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
        if (post && post.coverImage && post.thumbnail) {
          const deleteKeys = [
            {
              Key: post.coverImage,
            },
            {
              Key: post.thumbnail,
            },
          ];

          const deleteParams = {
            Bucket: 'simesim-staging',
            Delete: {
              Objects: deleteKeys,
            },
          };
          const data = await s3.send(new DeleteObjectsCommand(deleteParams));
          if (data.$metadata.httpStatusCode !== 204) {
            throw new Error('Error deleting file');
          }
        }
        const deleteOne: Post = await prisma.post.delete({
          ...input,
        });
        res.status(200).json({ success: true, data: deleteOne });
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
