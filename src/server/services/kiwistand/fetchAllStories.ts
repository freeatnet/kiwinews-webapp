import { z } from "zod";

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

export type Story = z.infer<typeof STORIES_API_RESPONSE_SCHEMA>["data"][number];
export type StoryKey = Story["href"];

const KIWISTAND_LIST_STORIES_URL =
  "https://news.kiwistand.com:8000/api/v1/list";
export async function fetchAllStories() {
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
export async function fetchAllStoriesCached() {
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

export async function refreshAllStoriesCached() {
  storiesCached = [];
  storiesCachedAt = 0;

  await fetchAllStoriesCached();
}
