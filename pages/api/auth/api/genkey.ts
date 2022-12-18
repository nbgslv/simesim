import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiKey, Prisma } from '@prisma/client';
import { unstable_getServerSession } from 'next-auth';
import prisma from '../../../../lib/prisma';
import { ApiResponse } from '../../../../lib/types/api';
import { authOptions } from '../[...nextauth]';

const { scryptSync, randomBytes } = await import('node:crypto');

function generateSecretHash(key: string) {
  const salt = randomBytes(8).toString('hex');
  const buffer = scryptSync(key, salt, 64) as Buffer;
  return `${buffer.toString('hex')}.${salt}`;
}

function generateKey(size = 32, format: BufferEncoding = 'base64') {
  const buffer: Buffer = randomBytes(size);
  return buffer.toString(format);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Partial<ApiKey> | Prisma.BatchPayload>>
) {
  const session = await unstable_getServerSession(
    req as NextApiRequest,
    res as NextApiResponse,
    authOptions(req as NextApiRequest, res as NextApiResponse)
  );
  if (!session) {
    res
      .status(401)
      .json({ name: 'UNAUTHORIZED', success: false, message: 'Unauthorized' });
    return;
  }
  const { method } = req;
  if (method === 'POST') {
    const key = generateKey();
    const secret = generateSecretHash(key);
    const newApiKeyRecord = await prisma.apiKey.create({
      data: {
        key: secret,
      },
    });
    if (newApiKeyRecord) {
      // eslint-disable-next-line no-console
      console.log({
        key,
        id: newApiKeyRecord.id,
      });
      res
        .status(200)
        .json({ success: true, data: { key, id: newApiKeyRecord.id } });
    }
    throw new Error('Something went wrong');
  } else if (method === 'DELETE') {
    const { action, input } = req.body;
    if (action === 'delete') {
      const deleted = await prisma.apiKey.delete({
        ...input,
      });
      if (deleted) {
        res.status(200).json({ success: true, data: deleted });
      }
    } else if (action === 'deleteMany') {
      const deleted = await prisma.apiKey.deleteMany({
        ...input,
      });
      if (deleted) {
        res.status(200).json({ success: true, data: deleted });
      }
    }
  } else {
    res.status(405).json({
      name: 'METHOD_NOT_ALLOWED',
      success: false,
      message: 'Method not allowed',
    });
  }
}
