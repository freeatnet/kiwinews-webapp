import { httpBatchLink, loggerLink, createTRPCProxyClient } from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { type AppRouter } from "~/server/api/root";

import { getBaseUrl } from "./getBaseUrl";

const proxyClient = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
  transformer: superjson,
});

export const apiProxy = createServerSideHelpers({
  client: proxyClient,
});
