import '../styles/global.scss'
import type { AppProps } from 'next/app'
import {SSRProvider, ThemeProvider} from "react-bootstrap";
import NiceModal from "@ebay/nice-modal-react";
import {SessionProvider} from "next-auth/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <SSRProvider>
          {/*@ts-ignore*/}
          <SessionProvider session={pageProps.session}>
              <ThemeProvider dir="rtl">
                  <NiceModal.Provider>
                    <Component {...pageProps} />
                  </NiceModal.Provider>
              </ThemeProvider>
          </SessionProvider>
      </SSRProvider>
  )
}

export default MyApp
