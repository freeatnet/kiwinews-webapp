import { TRPCError } from "@trpc/server";
import invariant from "ts-invariant";
import { getAddress } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { miniProfileForAddress } from "~/server/services/miniprofile";

import { findStoryWithHistory } from "./queries/findStoryWithHistory.query";

const SHOW_STORY_INPUT_SCHEMA = z.object({
  messageId: z.string().regex(/^0x[0-9a-f]{72}$/),
});

export const showStoryRouter = createTRPCRouter({
  get: publicProcedure
    .input(SHOW_STORY_INPUT_SCHEMA)
    .query(async ({ input, ctx: { edgedbClient } }) => {
      const [keyStory, ...restStories] = await findStoryWithHistory(
        edgedbClient,
        {
          messageId: input.messageId,
        },
      );

      if (!keyStory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Story with messageId ${input.messageId} not found`,
        });
      }

      const [poster, ...upvoters] = await Promise.all([
        miniProfileForAddress(getAddress(keyStory.identity)),
        ...restStories
          .map(({ identity }) => getAddress(identity))
          .map(miniProfileForAddress),
      ]);

      return {
        story: {
          ...keyStory,
          score: null,
          points: restStories.length + 1,
          poster,
          upvoters,
        },
        history: [
          {
            verb: "submit" as const,
            details: {
              ...keyStory,
              poster,
              identity: getAddress(keyStory.identity),
              signer: getAddress(keyStory.signer),
            },
          },
          ...restStories.map((story, idx) => {
            const poster = upvoters[idx];
            invariant(
              poster,
              `couldn't find poster miniprofile of ${story.signature}`,
            );

            return {
              verb: "upvote" as const,
              details: {
                ...story,
                poster,
                identity: getAddress(story.identity),
                signer: getAddress(story.signer),
              },
            };
          }),
        ],
      };
    }),
});
