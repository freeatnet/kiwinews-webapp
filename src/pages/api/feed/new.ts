import { Feed } from "feed";
import { type NextApiRequest, type NextApiResponse } from "next";

import { env } from "~/env.mjs";
import { extractDomain } from "~/features/feed";
import { formatAddressForDisplay } from "~/helpers";
import { createServerSideHelpers } from "~/utils/api/ssg";

const DEFAULT_STORIES_INPUT = {
  from: 0,
  amount: 25,
};

const THIS_FEED_URL = new URL(
  "/api/feed/new",
  env.NEXT_PUBLIC_BASE_URL
).toString();

export default async function handler(_: NextApiRequest, res: NextApiResponse) {
  const trpc = createServerSideHelpers({});
  const stories = await trpc.home.newStories.fetch(DEFAULT_STORIES_INPUT);

  const feed = new Feed({
    title: "Kiwi News - New",
    id: THIS_FEED_URL,
    link: THIS_FEED_URL,
    copyright: "Kiwi News Contributors",
  });

  for (const story of stories) {
    const { title, href, signature, timestamp, points, poster } = story;

    feed.addItem({
      id: signature,
      title: `${title} (${extractDomain(href)})`,
      link: href,
      date: new Date(Number(timestamp) * 1_000),
      author: [
        { name: formatAddressForDisplay(poster.address, poster.displayName) },
      ],
      content: `<p>${points} ${
        points !== 1 ? "points" : "point"
      }. Submitted by ${formatAddressForDisplay(
        poster.address,
        poster.displayName
      )}.</p>`,
    });
  }

  res
    .status(200)
    .setHeader("Content-Type", "application/atom+xml")
    .send(feed.atom1());
}
