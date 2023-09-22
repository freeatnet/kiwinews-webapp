import classNames from "classnames";
import { Html, Head, Main, NextScript } from "next/document";

import { env } from "~/env.mjs";

export default function Document() {
  return (
    <Html lang="en" className="min-h-screen">
      <Head>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <body
        className={classNames(
          "min-h-screen",
          env.NODE_ENV === "development" && "debug-screens",
        )}
      >
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
