import React from 'react';

const Link = ({ children }: { children: React.ReactNode }) =>
  React.cloneElement(children as React.ReactElement, { href: '/' } as any);

export default Link;
