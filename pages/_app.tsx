import '../styles/global.scss';
import type { AppProps } from 'next/app';
import { SSRProvider, ThemeProvider } from 'react-bootstrap';
import NiceModal from '@ebay/nice-modal-react';
import { SessionProvider } from 'next-auth/react';
import UserStoreProvider from '../lib/context/UserStore';
import { initialState, reducer } from '../lib/reducer/reducer';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SSRProvider>
      {/* @ts-ignore */}
      <SessionProvider session={pageProps.session}>
        <UserStoreProvider
          initialState={{ user: initialState.user }}
          reducer={reducer}
        >
          <ThemeProvider dir="rtl">
            <NiceModal.Provider>
              <Component {...pageProps} />
            </NiceModal.Provider>
          </ThemeProvider>
        </UserStoreProvider>
      </SessionProvider>
    </SSRProvider>
  );
}

export default MyApp;
