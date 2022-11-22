import React, { ReactNode } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

const MainLayout = ({
  children,
  hideJumbotron = false,
}: {
  children: ReactNode;
  hideJumbotron?: boolean;
}) => (
  <>
    <Header hideJumbotron={hideJumbotron} />
    {children}
    <Footer />
  </>
);

export default MainLayout;
