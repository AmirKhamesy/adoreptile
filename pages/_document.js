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
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          /* Only show content when Next.js has loaded */
          .next-loaded #__next {
            opacity: 1;
          }
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Add class when Next.js has loaded
            window.addEventListener('load', function() {
              document.body.classList.add('next-loaded');
            });
          `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
