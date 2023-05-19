import { Feed } from "feed";
import { type NextApiRequest, type NextApiResponse } from "next";

import { env } from "~/env.mjs";
import { extractDomain } from "~/features/feed";
import { createServerSideHelpers } from "~/utils/api/ssg";

const DEFAULT_STORIES_INPUT = {
  from: 0,
  amount: 25,
};

const THIS_FEED_URL = new URL(
  "/api/feed/top",
  env.NEXT_PUBLIC_BASE_URL
).toString();

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const trpc = createServerSideHelpers({});
  const stories = await trpc.home.topStories.fetch(DEFAULT_STORIES_INPUT);

  const feed = new Feed({
    title: "Kiwi News - Top",
    id: THIS_FEED_URL,
    link: THIS_FEED_URL,
    copyright: "Kiwi News Contributors",
  });

  for (const story of stories) {
    feed.addItem({
      id: story.signature,
      title: `${story.title} (${extractDomain(story.href)})`,
      link: story.href,
      date: new Date(Number(story.timestamp) * 1_000),
    });
  }

  res
    .status(200)
    .setHeader("Content-Type", "application/atom+xml")
    .send(feed.atom1());
}
