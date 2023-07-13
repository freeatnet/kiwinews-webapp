import invariant from "ts-invariant";
import { isAddressEqual } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  fetchAllStoriesCached,
  type Story,
  type StoryKey,
} from "~/server/services/kiwistand";
import { miniProfileForAddress } from "~/server/services/miniprofile";

const STORIES_INPUT_SCHEMA = z.object({
  from: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

/**
 * Given a list of stories, return a map of story links to the first submission
 * timestamp and the number of points.
 */
function tally(stories: Story[]) {
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

  return timestampsAndPoints;
}

const AGE_BUCKET_WIDTH = 3600;
const DECAY_FACTOR = 4;
const NEW_STORY_BOOST = 1.5;
const NEW_STORY_MAX_AGE = 12;
/**
 * Scoring
 * @see https://github.com/attestate/kiwistand/blob/d830d2b/src/store.mjs#L302-L320
 */
function scoreByDecayingPoints(
  timestamp: number,
  points: number,
  currentEpoch: number
) {
  const age = (currentEpoch - timestamp) / AGE_BUCKET_WIDTH;
  const isNew = age < NEW_STORY_MAX_AGE;

  const decayed = points / Math.pow(DECAY_FACTOR, age);

  return isNew ? decayed * NEW_STORY_BOOST : decayed;
}

/**
 * Scoring: the score of a story is the timestamp of the first submission of that story
 * (i.e., latest stories have the highest scores)
 */
function scoreByTimestamp(
  timestamp: number,
  _points: number,
  _currentEpoch: number
) {
  return timestamp;
}

export const homeRouter = createTRPCRouter({
  /**
   * Returns a list of "top" stories.
   * Rules:
   *   - story must have at least 2 points
   *   - stories with more points are ranked higher, subject to the decay factor
   */
  topStories: publicProcedure
    .input(STORIES_INPUT_SCHEMA)
    .query(async ({ input }) => {
      const stories = await fetchAllStoriesCached();

      const timestampsAndPoints = tally(stories);

      // Convert timestamps and point counts to scores
      const scores = new Map<StoryKey, number>();
      const currentEpoch = Math.trunc(Date.now() / 1000);
      for (const [key, [timestamp, points]] of timestampsAndPoints.entries()) {
        // only include stories with at least 2 points
        if (points > 1) {
          scores.set(
            key,
            scoreByDecayingPoints(timestamp, points, currentEpoch)
          );
        }
      }

      const sortedScores = Array.from(scores).sort(
        ([, scoreA], [, scoreB]) => scoreB - scoreA
      );

      const sortedStories = await Promise.all(
        sortedScores
          .slice(input.from, input.from + input.amount)
          .map(async ([key, score]) => {
            const storiesByHref = stories.filter((story) => story.href === key);
            const firstSubmission = storiesByHref[0];
            invariant(
              !!firstSubmission,
              `could not find story with key ${key} in the stories object`
            );

            const timestampAndPoints = timestampsAndPoints.get(key);
            invariant(
              !!timestampAndPoints,
              "could not find timestamp and points in map"
            );

            const [timestamp, points] = timestampAndPoints;

            const [poster, ...upvoters] = await Promise.all([
              miniProfileForAddress(firstSubmission.identity),
              ...storiesByHref
                .map(({ identity }) => identity)
                .filter(
                  (identity) =>
                    !isAddressEqual(identity, firstSubmission.identity)
                )
                .map(miniProfileForAddress),
            ]);

            return {
              ...firstSubmission,
              timestamp,
              points,
              score,
              poster,
              upvoters,
            };
          })
      );

      return sortedStories;
    }),

  /**
   * Returns a list of "new" stories.
   * Rules:
   *  - story must have at most 1 point
   *  - stories are returned in reverse chronological order (latest first)
   */
  newStories: publicProcedure
    .input(STORIES_INPUT_SCHEMA)
    .query(async ({ input }) => {
      const stories = await fetchAllStoriesCached();

      const timestampsAndPoints = tally(stories);

      // Convert timestamps and point counts to scores
      const scores = new Map<StoryKey, number>();
      const currentEpoch = Math.trunc(Date.now() / 1000);
      for (const [key, [timestamp, points]] of timestampsAndPoints.entries()) {
        // exclude stories with >1 point
        if (points <= 1) {
          scores.set(key, scoreByTimestamp(timestamp, points, currentEpoch));
        }
      }

      const sortedScores = Array.from(scores).sort(
        ([, scoreA], [, scoreB]) => scoreB - scoreA
      );

      const sortedStories = await Promise.all(
        sortedScores
          .slice(input.from, input.from + input.amount)
          .map(async ([key, score]) => {
            // since we filtered out stories with >1 point, we can just take the first story as the original submission
            const firstSubmission = stories.find((story) => story.href === key);
            invariant(
              !!firstSubmission,
              `could not find story with key ${key} in the stories object`
            );

            const timestampAndPoints = timestampsAndPoints.get(key);
            invariant(
              !!timestampAndPoints,
              "could not find timestamp and points in map"
            );

            const [timestamp, points] = timestampAndPoints;
            const poster = await miniProfileForAddress(
              firstSubmission.identity
            );
            return {
              ...firstSubmission,
              timestamp,
              points,
              score,
              poster,
              upvoters: [],
            };
          })
      );

      return sortedStories;
    }),
});
