import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          body {
            background-color: #EEFDF4;
            margin: 0;
            padding: 0;
          }
          #__next {
            padding-top: 70px; /* Height of the header */
          }
        `}</style>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
