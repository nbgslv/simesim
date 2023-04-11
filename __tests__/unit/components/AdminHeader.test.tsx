import { render, screen, fireEvent } from '@testing-library/react';
import { signOut } from 'next-auth/react';
import * as Sentry from '@sentry/nextjs';
import { Router } from 'next/router';
import React from 'react';
import AdminHeader from '../../../components/AdminHeader/AdminHeader';

jest.mock('@sentry/nextjs');
jest.mock('next/link', () => ({ children }: { children: React.ReactNode }) =>
  React.cloneElement(children as React.ReactElement, { href: '/' } as any)
);
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: {
      email: '0512345678',
      emailEmail: 'test@test.com',
      id: 'clcclcclcclcclcclc1234',
      image: null,
      name: 'foo bar',
      role: 'ADMIN',
    },
  };
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(
      () => ({ data: mockSession, status: 'authenticated' }) // return type is [] in v3 but changed to {} in v4
    ),
    signOut: jest.fn(() =>
      Promise.resolve({ url: process.env.NEXTAUTH_URL as string })
    ),
  };
});

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

  test('renders the header with all navigation links', () => {
    render(<AdminHeader />);

    expect(screen.getAllByRole('link')).toHaveLength(15);
  });

  test('clicking the sign out link calls Sentry.setUser and signOut', () => {
    const setUserMock = jest.spyOn(Sentry, 'setUser');

    render(<AdminHeader />);
    fireEvent.click(screen.getByText('התנתק'));

    expect(setUserMock).toHaveBeenCalledTimes(1);
    expect(setUserMock).toHaveBeenCalledWith(null);
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  // TODO next router navigation(link clicks)
});
