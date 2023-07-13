import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { refreshAllStoriesCached } from "~/server/services/kiwistand/fetchAllStories";

const POST_STORY_INPUT_SCHEMA = z.object({
  title: z.string().nonempty(),
  href: z.string().url(),
  type: z.literal("amplify"),
  timestamp: z.number(),
  signature: z.string().regex(/^0x[0-9a-f]{130}$/),
});

const POST_UPVOTE_INPUT_SCHEMA = z.object({
  title: z.string().length(0),
  href: z.string().url(),
  type: z.literal("amplify"),
  timestamp: z.number(),
  signature: z.string().regex(/^0x[0-9a-f]{130}$/),
});

// success response example:
// { status: 'success', code: 200, message: 'OK', details: 'Message included' }

// error response example:
// {"status":"error","code":400,"message":"Bad Request","details":"Error: Address \\"0x7252921bD62996dE2fC352710AeA0295a4143218\\" wasn't found in the allow list. Dropping message."}
const MESSAGES_API_ERROR_SCHEMA = z.object({
  status: z.literal("error"),
  code: z.number().gte(400).lt(600),
  message: z.string(),
  details: z.string(),
});

const KIWISTAND_POST_STORIES_URL =
  "https://news.kiwistand.com:8000/api/v1/messages";

export const postRouter = createTRPCRouter({
  story: publicProcedure
    .input(POST_STORY_INPUT_SCHEMA)
    .mutation(async ({ input }) => {
      const response = await fetch(KIWISTAND_POST_STORIES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const body = await response.json();
          console.error("Error while posting story", {
            status: response.status,
            statusText: response.statusText,
            body: JSON.stringify(body),
          });

          const remoteError = MESSAGES_API_ERROR_SCHEMA.parse(body);
          const message = `${remoteError.message}: ${remoteError.details}`;

          throw new TRPCError({
            code: "BAD_REQUEST",
            message,
          });
        }

        console.error("Error while posting story", {
          status: response.status,
          statusText: response.statusText,
          bodyText: await response.text(),
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error: could not fetch articles",
          cause: {
            response,
          },
        });
      }

      const responseJson = await response.json();

      // eslint-disable-next-line no-console -- TODO: remove
      console.log("responseJson", responseJson);

      await refreshAllStoriesCached();

      return {
        ...input,
      };
    }),
  upvote: publicProcedure
    .input(POST_UPVOTE_INPUT_SCHEMA)
    .mutation(async ({ input }) => {
      const response = await fetch(KIWISTAND_POST_STORIES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (response.status === 400) {
        const body = await response.json();
        console.error("Error while posting upvote", {
          status: response.status,
          statusText: response.statusText,
          body: JSON.stringify(body),
        });

        const remoteError = MESSAGES_API_ERROR_SCHEMA.parse(body);

        // treat duplicate error as success
        const isDuplicateError = remoteError.details.match(
          /It was probably submitted and accepted before/
        );
        if (!isDuplicateError) {
          const message = `${remoteError.message}: ${remoteError.details}`;

          throw new TRPCError({
            code: "BAD_REQUEST",
            message,
          });
        }
      } else if (!response.ok) {
        console.error("Error while posting upvote", {
          status: response.status,
          statusText: response.statusText,
          bodyText: await response.text(),
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error: error while posting upvote",
          cause: {
            response,
          },
        });
      } else {
        const responseJson = await response.json();

        // eslint-disable-next-line no-console -- TODO: remove
        console.log("responseJson", responseJson);
      }

      await refreshAllStoriesCached();

      return {
        ...input,
      };
    }),
});
