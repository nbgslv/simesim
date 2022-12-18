import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { redirect } from 'next/dist/server/api-utils';
import { scryptSync, timingSafeEqual } from 'crypto';
import prisma from '../lib/prisma';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export async function verifyAdmin(context: NextPageContext) {
  const session = await unstable_getServerSession(
    context.req as NextApiRequest,
    context.res as NextApiResponse,
    authOptions(context.req as NextApiRequest, context.res as NextApiResponse)
  );
  if (!session) {
    redirect(context.res as NextApiResponse, '/');
  }
  if (session && session.user) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });
    if (user && user.role !== 'ADMIN') {
      redirect(context.res as NextApiResponse, '/');
    }
  } else {
    redirect(context.res as NextApiResponse, '/');
  }
  return null;
}

function compareKeys(storedKey: string, suppliedKey: string) {
  const [hashedPassword, salt] = storedKey.split('.');

  const buffer = scryptSync(suppliedKey, salt, 64) as Buffer;
  return timingSafeEqual(Buffer.from(hashedPassword, 'hex'), buffer);
}

export const verifyApi = async (authorization: string) => {
  const [type, key, id] = authorization.split(' ');
  if (type !== 'Bearer' || !key || !id) {
    return false;
  }
  const storedKey = await prisma.apiKey.findUnique({
    where: {
      id,
    },
  });

  if (storedKey) {
    return compareKeys(storedKey.key, key);
  }
  return false;
};
