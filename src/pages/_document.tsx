import classNames from "classnames";
import { Html, Head, Main, NextScript } from "next/document";

import { env } from "~/env.mjs";

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <div
          className={classNames(
            "bg-ivory",
            env.NODE_ENV === "development" && "debug-screens"
          )}
        >
          <Main />
          <NextScript />
        </div>
      </body>
    </Html>
  );
}
