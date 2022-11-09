import '../styles/global.scss'
import type { AppProps } from 'next/app'
import {SSRProvider, ThemeProvider} from "react-bootstrap";
import NiceModal from "@ebay/nice-modal-react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <SSRProvider>
          <ThemeProvider dir="rtl">
              <NiceModal.Provider>
                <Component {...pageProps} />
              </NiceModal.Provider>
          </ThemeProvider>
      </SSRProvider>
  )
}

export default MyApp
