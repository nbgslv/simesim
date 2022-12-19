import React from 'react';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { User } from '@prisma/client';
import { Alert, Container } from 'react-bootstrap';
import { authOptions } from '../api/auth/[...nextauth]';
import prisma from '../../lib/prisma';
import MainLayout from '../../components/Layouts/MainLayout';
import ChangeDetailsForm from '../../components/User/ChangeDetailsForm';
import styles from '../../styles/changeDetails.module.scss';

const ChangeDetails = ({ user }: { user: Partial<User> }) => {
  const router = useRouter();
  return (
    <MainLayout title="עדכון פרטים" hideJumbotron>
      <Container className={styles.main}>
        <h1 className="text-center mb-3 p-2">הפרטים שלי</h1>
        <ChangeDetailsForm user={user} />
        {router.query.success && (
          <Alert variant="success" className="mt-3 text-center">
            הפרטים עודכנו בהצלחה
          </Alert>
        )}
      </Container>
    </MainLayout>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const session = await unstable_getServerSession(
    context.req as NextApiRequest,
    context.res as NextApiResponse,
    authOptions(context.req as NextApiRequest, context.res as NextApiResponse)
  );
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  if (session && session.user) {
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        emailEmail: true,
      },
    });
    return {
      props: {
        user,
      },
    };
  }
  return {
    props: {},
  };
}

export default ChangeDetails;
