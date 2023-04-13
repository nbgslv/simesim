import React from 'react';

const Link = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) =>
  React.cloneElement(
    children as React.ReactElement,
    { href, 'data-testid': href } as any
  );

export default Link;
