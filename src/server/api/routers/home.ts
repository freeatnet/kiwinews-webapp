import { TRPCError } from "@trpc/server";
import invariant from "ts-invariant";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const STORIES_INPUT_SCHEMA = z.object({
  from: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

const STORIES_API_RESPONSE_SCHEMA = z.object({
  data: z.array(
    z.object({
      title: z.string(),
      href: z.string().url(),
      type: z.literal("amplify"),
      timestamp: z.number(),
      signature: z.string(),
    })
  ),
});

type Story = z.infer<typeof STORIES_API_RESPONSE_SCHEMA>["data"][number];
type StoryKey = Story["href"];

const KIWISTAND_LIST_STORIES_URL = "https://news.kiwistand.com/list";
async function fetchAllStories() {
  const stories: Story[] = [];

  for (let from = 0; true; from += 50) {
    const request = await fetch(KIWISTAND_LIST_STORIES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        amount: 50,
      }),
    });

    if (!request.ok) {
      console.error("Error while fetching stories", {
        status: request.status,
        statusText: request.statusText,
        bodyText: await request.text(),
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error: could not fetch articles",
        cause: {
          request,
        },
      });
    }

    const responseJson = await request.json();

    const { data } = STORIES_API_RESPONSE_SCHEMA.parse(responseJson);
    stories.push(...data);

    if (data.length === 0) {
      break;
    }
  }

  return stories;
}

let fetchAllStoriesPromise: ReturnType<typeof fetchAllStories> | undefined =
  undefined;
async function fetchAllStoriesExclusive() {
  if (!fetchAllStoriesPromise) {
    fetchAllStoriesPromise = fetchAllStories()
      .then((result) => {
        fetchAllStoriesPromise = undefined;
        return result;
      })
      .catch((err) => {
        fetchAllStoriesPromise = undefined;
        throw err;
      });
  }

  return fetchAllStoriesPromise;
}

const STORIES_CACHE_STALE_TTL = 10_000;
const STORIES_CACHE_EXPIRE_TTL = 20_000;
let storiesCached: Story[] = [];
let storiesCachedAt = 0;

/**
 * Fetches stories from the Kiwistand API, caching them for a short time.
 * If the cache is stale, a request to refresh the stories will be made in the background.
 * If the cache is expired, a request to refresh the stories will be made synchronously.
 */
async function fetchAllStoriesCached() {
  const now = Date.now();

  if (now - storiesCachedAt > STORIES_CACHE_EXPIRE_TTL) {
    storiesCached = [];
  }

  if (!storiesCached.length) {
    storiesCached = await fetchAllStoriesExclusive();
    storiesCachedAt = now;
  } else if (now - storiesCachedAt > STORIES_CACHE_STALE_TTL) {
    void fetchAllStoriesExclusive()
      .then((stories) => {
        storiesCached = stories;
        storiesCachedAt = now;
      })
      .catch((err) => {
        console.error(err, "failed to refresh stories in the background");
      });
  }

  return storiesCached;
}

const AGE_BUCKET_WIDTH = 3600;
const DECAY_FACTOR = 4;
const NEW_STORY_BOOST = 1.5;
const NEW_STORY_MAX_AGE = 12;
/**
 * Scoring
 * @see https://github.com/attestate/kiwistand/blob/d830d2b/src/store.mjs#L302-L320
 */
function score(timestamp: number, points: number, currentEpoch: number) {
  const age = (currentEpoch - timestamp) / AGE_BUCKET_WIDTH;
  const isNew = age < NEW_STORY_MAX_AGE;

  const decayed = points / Math.pow(DECAY_FACTOR, age);

  return isNew ? decayed * NEW_STORY_BOOST : decayed;
}

export const homeRouter = createTRPCRouter({
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

      const sortedStories = sortedScores
        .slice(input.from, input.from + input.amount)
        .map(([key, score]) => {
          const story =
            // find the story by href with a title, falling back on one without a title
            stories.find((story) => story.href === key && !!story.title) ??
            stories.find((story) => story.href === key);
          invariant(
            !!story,
            `could not find story with key ${key} in the stories object`
          );

          const timestampAndPoints = timestampsAndPoints.get(key);
          invariant(
            !!timestampAndPoints,
            "could not find timestamp and points in map"
          );

          const [timestamp, points] = timestampAndPoints;
          return { ...story, timestamp, points, score };
        });

      return sortedStories;
    }),
});
