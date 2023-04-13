import { render, screen, fireEvent } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { Router } from 'next/router';
import React from 'react';
import AdminHeader from '../../../components/AdminHeader/AdminHeader';

describe('AdminHeader', () => {
  const spies: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
    spies.routerChangeStart = jest.fn();
    Router.events.on('routeChangeStart', spies.routerChangeStart);
  });

  afterEach(() => {
    Router.events.off('routeChangeStart', spies.routerChangeStart);
  });

  it('matches snapshot', () => {
    const { container } = render(<AdminHeader />);
    expect(container).toMatchSnapshot();
  });

  it('renders the header with all navigation links', () => {
    render(<AdminHeader />);

    expect(screen.getAllByRole('link')).toHaveLength(15);
  });

  it('clicking the sign out link calls Sentry.setUser and signOut', () => {
    const setUserMock = jest.spyOn(Sentry, 'setUser');

    render(<AdminHeader />);
    fireEvent.click(screen.getByText('התנתק'));

    expect(setUserMock).toHaveBeenCalledTimes(1);
    expect(setUserMock).toHaveBeenCalledWith(null);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  // TODO next router navigation(link clicks)
});
