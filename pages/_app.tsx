import '../styles/global.scss';
import type { AppProps } from 'next/app';
import Script from 'next/script';
import { SSRProvider, ThemeProvider } from 'react-bootstrap';
import NiceModal from '@ebay/nice-modal-react';
import { SessionProvider } from 'next-auth/react';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import UserStoreProvider from '../lib/context/UserStore';
import { initialState, reducer } from '../lib/reducer/reducer';
import * as gtag from '../lib/gtag';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: any) => {
      gtag.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Script src="https://cdn.enable.co.il/licenses/enable-L15802dmirvhc1a8-1122-37877/init.js" />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-Y16F868LV0"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
  
            gtag('config', 'G-Y16F868LV0');`,
        }}
      />
      <Script
        id="micro-clarity"
        type="text/javascript"
        dangerouslySetInnerHTML={{
          __html: `            
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "f8eqfigs56");`,
        }}
      />

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
                <PayPalScriptProvider
                  options={{
                    'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                    currency: 'ILS',
                    'disable-funding': 'credit,card,paylater',
                  }}
                >
                  <NiceModal.Provider>
                    <Component {...pageProps} />
                  </NiceModal.Provider>
                </PayPalScriptProvider>
              </ThemeProvider>
            </UserStoreProvider>
          </SessionProvider>
        </GoogleReCaptchaProvider>
      </SSRProvider>
    </>
  );
}

export default MyApp;
