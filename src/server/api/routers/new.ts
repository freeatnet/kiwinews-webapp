import invariant from "ts-invariant";
import { isAddressEqual } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  fetchAllStoriesCached,
  type StoryKey,
} from "~/server/services/kiwistand";
import { miniProfileForAddress } from "~/server/services/miniprofile";

const STORIES_INPUT_SCHEMA = z.object({
  from: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

/**
 * Scoring: the score of a story is the timestamp of the first submission of that story
 * (i.e., latest stories have the highest scores)
 */
function score(timestamp: number, _points: number, _currentEpoch: number) {
  return timestamp;
}

export const newRouter = createTRPCRouter({
  stories: publicProcedure
    .input(STORIES_INPUT_SCHEMA)
    .query(async ({ input }) => {
      // TODO(@freeatnet): Actual caching
      const stories = await fetchAllStoriesCached();

      const timestampsAndPoints = new Map<
        StoryKey,
        [timestamp: number, points: number]
      >();

      // Count points for each story noting the first submission timestamp for each story
      for (const story of stories) {
        const key = story.href;
        const current = timestampsAndPoints.get(key);

        if (current) {
          const minTimestamp = Math.min(current[0], story.timestamp);
          timestampsAndPoints.set(key, [minTimestamp, current[1] + 1]);
        } else {
          timestampsAndPoints.set(key, [story.timestamp, 1]);
        }
      }

      // Convert timestamps and point counts to scores
      const scores = new Map<StoryKey, number>();
      const currentEpoch = Math.trunc(Date.now() / 1000);
      for (const [key, [timestamp, points]] of timestampsAndPoints.entries()) {
        scores.set(key, score(timestamp, points, currentEpoch));
      }

      const sortedScores = Array.from(scores).sort(
        ([, scoreA], [, scoreB]) => scoreB - scoreA
      );

      const sortedStories = await Promise.all(
        sortedScores
          .slice(input.from, input.from + input.amount)
          .map(async ([key, score]) => {
            const storiesByHref = stories.filter((story) => story.href === key);
            const keyStory =
              storiesByHref.find((story) => !!story.title) ??
              // find the story by href with a title, falling back on one without a title
              storiesByHref[0];
            invariant(
              !!keyStory,
              `could not find story with key ${key} in the stories object`
            );

            const timestampAndPoints = timestampsAndPoints.get(key);
            invariant(
              !!timestampAndPoints,
              "could not find timestamp and points in map"
            );

            const [timestamp, points] = timestampAndPoints;

            const [poster, ...upvoters] = await Promise.all([
              miniProfileForAddress(keyStory.identity),
              ...storiesByHref
                .map(({ identity }) => identity)
                .filter(
                  (identity) => !isAddressEqual(identity, keyStory.identity)
                )
                .map(miniProfileForAddress),
            ]);

            return { ...keyStory, timestamp, score, points, poster, upvoters };
          })
      );

      return sortedStories;
    }),
});
