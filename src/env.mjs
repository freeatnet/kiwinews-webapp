import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    KIWISTAND_API_HOST: z.string().nonempty(),
    KIWISTAND_MESSAGES_MAX_PAGE_SIZE: z.coerce.number().int().positive(),
    STORIES_CACHE_STALE_TTL: z.coerce.number().int().positive(),
    STORIES_CACHE_EXPIRE_TTL: z.coerce.number().int().positive(),
    VIEM_HTTP_RPC: z.string().url().nonempty(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_RAINBOW_APP_NAME: z.string().nonempty(),
    NEXT_PUBLIC_ALCHEMY_API_KEY: z.string().nonempty(),
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().nonempty(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    KIWISTAND_API_HOST: process.env.KIWISTAND_API_HOST,
    KIWISTAND_MESSAGES_MAX_PAGE_SIZE:
      process.env.KIWISTAND_MESSAGES_MAX_PAGE_SIZE,
    NEXT_PUBLIC_RAINBOW_APP_NAME: process.env.NEXT_PUBLIC_RAINBOW_APP_NAME,
    NEXT_PUBLIC_ALCHEMY_API_KEY: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    STORIES_CACHE_STALE_TTL: process.env.STORIES_CACHE_STALE_TTL,
    STORIES_CACHE_EXPIRE_TTL: process.env.STORIES_CACHE_EXPIRE_TTL,
    VIEM_HTTP_RPC: process.env.VIEM_HTTP_RPC,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
