import '../styles/global.scss';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { SSRProvider, ThemeProvider } from 'react-bootstrap';
import NiceModal from '@ebay/nice-modal-react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import UserStoreProvider from '../lib/context/UserStore';
import { initialState, reducer } from '../lib/reducer/reducer';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script src="https://cdn.enable.co.il/licenses/enable-L15802dmirvhc1a8-1122-37877/init.js" />
      <SSRProvider>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
          language={'iw'}
        >
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
        </GoogleReCaptchaProvider>
      </SSRProvider>
    </>
  );
}

export default MyApp;
