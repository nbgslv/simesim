import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const MainLayout = ({
  title,
  children,
  hideJumbotron = false,
  metaDescription,
}: {
  title: string;
  children: ReactNode;
  hideJumbotron?: boolean;
  metaDescription?: string;
}) => (
  <>
    <Head>
      <title>{title}</title>
      {metaDescription && <meta name="description" content={metaDescription} />}
    </Head>
    <Header hideJumbotron={hideJumbotron} />
    <main>{children}</main>
    <Footer />
  </>
);

export default MainLayout;
