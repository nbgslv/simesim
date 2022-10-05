import '../styles/global.scss'
import type { AppProps } from 'next/app'
import {SSRProvider, ThemeProvider} from "react-bootstrap";

function MyApp({ Component, pageProps }: AppProps) {
  return (
      <SSRProvider>
          <ThemeProvider dir="rtl">
            <Component {...pageProps} />
          </ThemeProvider>
      </SSRProvider>
  )
}

export default MyApp
