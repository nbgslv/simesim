import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { redirect } from 'next/dist/server/api-utils';
import prisma from '../lib/prisma';
import { authOptions } from '../pages/api/auth/[...nextauth]';

// eslint-disable-next-line import/prefer-default-export
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
