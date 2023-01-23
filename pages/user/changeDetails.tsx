import React, { useEffect } from 'react';
import { unstable_getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { User } from '@prisma/client';
import { Alert, Container, Spinner } from 'react-bootstrap';
import { authOptions } from '../api/auth/[...nextauth]';
import prisma from '../../lib/prisma';
import MainLayout from '../../components/Layouts/MainLayout';
import ChangeDetailsForm from '../../components/User/ChangeDetailsForm';
import styles from '../../styles/changeDetails.module.scss';

const ChangeDetails = ({ user }: { user: Partial<User> }) => {
  const [userDetails, setUserDetails] = React.useState<Partial<User> | null>(
    null
  );
  const [updateSuccess, setUpdateSuccess] = React.useState<boolean | null>(
    null
  );
  const [pageLoading, setPageLoading] = React.useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setPageLoading(true);
        if (router.query.changeDetailsId) {
          const updatedUser = await fetch(
            `/api/user/${router.query.changeDetailsId}`,
            {
              method: 'PUT',
            }
          );
          const updatedUserJson = await updatedUser.json();
          if (updatedUserJson.success) {
            setUpdateSuccess(true);
            setUserDetails(updatedUserJson.data);
          } else {
            setUpdateSuccess(false);
            setUserDetails(user);
          }
        } else {
          setUserDetails(user);
        }
      } catch (e) {
        console.error(e);
        setUpdateSuccess(false);
        setUserDetails(user);
      } finally {
        setPageLoading(false);
      }
    })();
  }, [router.query.changeDetailsId]);

  if (pageLoading) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" style={{ color: '#fff' }} />
      </div>
    );
  }

  return (
    <MainLayout title="עדכון פרטים" hideJumbotron>
      <Container className={`${styles.main} p-2`}>
        <h1 className="text-center mb-3">הפרטים שלי</h1>
        <ChangeDetailsForm user={userDetails as Partial<User>} />
        {updateSuccess === true && (
          <Alert variant="success" className="mt-3 text-center">
            הפרטים עודכנו בהצלחה
          </Alert>
        )}
        {updateSuccess === false && (
          <Alert variant="danger" className="mt-3 text-center">
            התרחשה שגיאה בעת ניסיון עדכון הפרטים
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
