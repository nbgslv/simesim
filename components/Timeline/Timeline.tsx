import React from 'react';

const Timeline = ({ children }: { children: JSX.Element | JSX.Element[] }) => (
  <div className="w-100 h-100 d-flex justify-content-between align-items-center">
    {children}
  </div>
);

export default Timeline;
