import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html dir="rtl" lang="he">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;600&display=swap"
                    rel="stylesheet"
                />
                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.rtl.min.css"
                    integrity="sha384-gXt9imSW0VcJVHezoNQsP+TNrjYXoGcrqBZJpry9zJt8PCQjobwmhMGaDHTASo9N"
                    crossOrigin="anonymous"
                />
            </Head>
        <body>
            <Main />
            <NextScript />
        </body>
        </Html>
    )
}
