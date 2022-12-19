import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const MainLayout = ({
  title,
  children,
  hideJumbotron = false,
}: {
  title: string;
  children: ReactNode;
  hideJumbotron?: boolean;
}) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>
    <Header hideJumbotron={hideJumbotron} />
    <main>{children}</main>
    <Footer />
  </>
);

export default MainLayout;
