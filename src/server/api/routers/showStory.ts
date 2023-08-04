import { TRPCError } from "@trpc/server";
import invariant from "ts-invariant";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchAllStoriesCached } from "~/server/services/kiwistand";
import { miniProfileForAddress } from "~/server/services/miniprofile";

const SHOW_STORY_INPUT_SCHEMA = z.object({
  id: z.string().regex(/^0x[0-9a-f]{72}$/),
});

export const showStoryRouter = createTRPCRouter({
  get: publicProcedure
    .input(SHOW_STORY_INPUT_SCHEMA)
    .query(async ({ input }) => {
      const stories = await fetchAllStoriesCached();

      const keyStory = stories.find(({ id }) => id === input.id);

      if (!keyStory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Could not find story with id ${input.id}`,
        });
      }

      const restStories = stories.filter(
        ({ href, id }) => href === keyStory.href && id !== input.id
      );

      const [poster, ...upvoters] = await Promise.all([
        miniProfileForAddress(keyStory.identity),
        ...restStories
          .map(({ identity }) => identity)
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
            details: { ...keyStory, poster },
          },
          ...restStories.map((story, idx) => {
            const poster = upvoters[idx];
            invariant(
              poster,
              `couldn't find poster miniprofile of ${story.signature}`
            );

            return {
              verb: "upvote" as const,
              details: { ...story, poster },
            };
          }),
        ],
      };
    }),
});
