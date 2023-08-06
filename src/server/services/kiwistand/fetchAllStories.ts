import { isAddress } from "viem";
import { z } from "zod";

import { env } from "~/env.mjs";

const STORIES_API_RESPONSE_SCHEMA = z.object({
  data: z.array(
    z.object({
      title: z.string(),
      href: z.string().url(),
      type: z.literal("amplify"),
      timestamp: z.number(),
      signature: z.string(),
      signer: z.string().refine(isAddress, {
        message: "Must be a valid address",
      }),
      identity: z.string().refine(isAddress, {
        message: "Must be a valid address",
      }),
    })
  ),
});

export type Story = z.infer<typeof STORIES_API_RESPONSE_SCHEMA>["data"][number];
export type StoryKey = Story["href"];

const KIWISTAND_LIST_STORIES_URL = new URL(
  `/api/v1/list`,
  env.KIWISTAND_API_HOST
).toString();
const KIWISTAND_MAX_MESSAGES_PER_PAGE = env.KIWISTAND_MESSAGES_MAX_PAGE_SIZE;

export async function fetchAllStories() {
  const runId = Math.random().toString(36).slice(2, 8);
  const stories: Story[] = [];

  console.debug(`[${runId}]`, "start fetching stories", Date.now());
  // eslint-disable-next-line no-console
  console.time(`[${runId}] fetchAllStories`);
  for (let from = 0; true; from += KIWISTAND_MAX_MESSAGES_PER_PAGE) {
    // eslint-disable-next-line no-console
    console.time(`[${runId}] fetchAllStories from=${from} fetch`);
    const request = await fetch(KIWISTAND_LIST_STORIES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: from,
        amount: KIWISTAND_MAX_MESSAGES_PER_PAGE,
      }),
    });

    if (!request.ok) {
      const responseText = await request.text();
      const cause = {
        status: request.status,
        statusText: request.statusText,
        bodyText: responseText,
      };

      console.error("could not fetch stories", cause);
      throw new Error("could not fetch stories", { cause });
    }

    const responseJson = await request.json();
    // eslint-disable-next-line no-console
    console.timeEnd(`[${runId}] fetchAllStories from=${from} fetch`);

    // eslint-disable-next-line no-console
    console.time(`[${runId}] fetchAllStories from=${from} parse and push`);
    const { data } = STORIES_API_RESPONSE_SCHEMA.parse(responseJson);
    stories.push(...data);
    // eslint-disable-next-line no-console
    console.timeEnd(`[${runId}] fetchAllStories from=${from} parse and push`);

    if (data.length === 0) {
      break;
    }
  }

  const sorted = stories.sort(({ timestamp: a }, { timestamp: b }) => a - b);
  // eslint-disable-next-line no-console
  console.timeEnd(`[${runId}] fetchAllStories`);

  return sorted;
}

const STORIES_CACHE_STALE_TTL = env.STORIES_CACHE_STALE_TTL;
const STORIES_CACHE_EXPIRE_TTL = env.STORIES_CACHE_EXPIRE_TTL;
let storiesCached: Story[] = [];
let storiesCachedAt = 0;
let fetchAllStoriesPromise: ReturnType<typeof fetchAllStories> | undefined =
  undefined;

async function fetchAllStoriesExclusive() {
  if (!fetchAllStoriesPromise) {
    console.debug(
      "fetchAllStoriesExclusive: setting up a new promise",
      Date.now()
    );

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

/**
 * Fetches stories from the Kiwistand API, caching them for a short time.
 * If the cache is stale, a request to refresh the stories will be made in the background.
 * If the cache is expired, a request to refresh the stories will be made synchronously.
 */
export async function fetchAllStoriesCached() {
  const now = Date.now();
  const cacheAge = now - storiesCachedAt;
  console.debug("fetchAllStoriesCached: cache age", cacheAge, "ms");

  if (cacheAge > STORIES_CACHE_EXPIRE_TTL) {
    console.debug("fetchAllStoriesCached: reset cache");
    storiesCached = [];
  }

  if (!storiesCached.length) {
    console.debug(
      "fetchAllStoriesCached: fetchAllStoriesExclusive synchronously"
    );

    storiesCached = await fetchAllStoriesExclusive();
    storiesCachedAt = now;
  } else if (cacheAge > STORIES_CACHE_STALE_TTL) {
    console.debug(
      "fetchAllStoriesCached: fetchAllStoriesExclusive in background"
    );

    void fetchAllStoriesExclusive()
      .then((stories) => {
        storiesCached = stories;
        storiesCachedAt = now;
      })
      .catch((err) => {
        console.error(
          err,
          "fetchAllStoriesCached: failed to refresh stories in the background"
        );
      });
  } else {
    console.debug("fetchAllStoriesCached: just return the stories");
  }

  return storiesCached;
}

export async function refreshAllStoriesCached() {
  storiesCached = [];
  storiesCachedAt = 0;

  await fetchAllStoriesCached();
}
