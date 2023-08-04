import classNames from "classnames";
import { type InferGetStaticPropsType } from "next";
import Head from "next/head";
import { useMemo } from "react";
import invariant from "ts-invariant";
import { isAddressEqual } from "viem";
import { z } from "zod";

import { StoriesList, StoryContainer } from "~/features/feed";
import { formatTimeAgo } from "~/features/feed/helpers";
import { formatAddressForDisplay } from "~/helpers";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

const PAGE_PARAMS_SCHEMA = z.object({
  id: z.string(),
});

export const getStaticProps = withStaticAPIHelpers(
  async ({ trpc, params: rawParams }) => {
    const { id } = PAGE_PARAMS_SCHEMA.parse(rawParams);
    await trpc.showStory.get.prefetch({ id });

    return {
      props: {
        id,
      },
      revalidate: 60,
    };
  }
);

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

function StoryHistoryEntry({
  verb,
  details: { poster, timestamp, identity, signer },
  isLastItem = false,
}: {
  verb: "submit" | "upvote";
  details: {
    poster: {
      address: string;
      displayName: string | null;
    };
    timestamp: number;
    identity: `0x${string}`;
    signer: `0x${string}`;
  };
  isLastItem?: boolean;
}) {
  const isoTimestamp = useMemo(
    () => new Date(timestamp * 1000).toISOString(),
    [timestamp]
  );
  const timeAgo = useMemo(() => formatTimeAgo(timestamp), [timestamp]);

  return (
    <li className="relative flex items-center gap-x-4">
      <div
        className={classNames(
          isLastItem ? "h-6" : "-bottom-6",
          "absolute left-0 top-0 flex w-6 justify-center"
        )}
      >
        <div className="w-px bg-gray-200"></div>
      </div>
      <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-transparent">
        <div className="h-1.5 w-1.5 rounded-full bg-gray-100 ring-1 ring-gray-300"></div>
      </div>

      <p className="flex-auto py-0.5 leading-5 text-gray-500">
        <span>
          {formatAddressForDisplay(poster.address, poster.displayName)}
          {!isAddressEqual(identity, signer) && (
            <sup
              className="text-xs text-amber-600"
              title={`${formatAddressForDisplay(
                poster.address,
                poster.displayName
              )} used Kiwi delegation to ${verb} this story. Awesome!`}
            >
              Đ
            </sup>
          )}
        </span>{" "}
        <span>{verb === "submit" ? "submitted" : "upvoted"}</span>
      </p>
      <time
        suppressHydrationWarning
        dateTime={isoTimestamp}
        title={isoTimestamp}
        className="flex-none py-0.5 text-sm leading-5 text-gray-500"
      >
        {timeAgo}
      </time>
    </li>
  );
}

export default function StoryShow({
  id,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data } = api.showStory.get.useQuery({ id });

  invariant(!!data, "data should never be empty");
  const { story, history } = data;

  return (
    <>
      <Head>
        <title>{story.title} on Kiwi News</title>
      </Head>
      <TopNav />
      <div className="mx-auto mb-8 mt-4 max-w-4xl px-4 pt-4">
        <StoriesList>
          <StoryContainer key={story.signature} {...story} />
        </StoriesList>

        <ul role="list" className="space-y-2 pl-2 pt-6">
          {history.map((h, idx) => (
            <StoryHistoryEntry
              {...h}
              key={h.details.signature}
              isLastItem={idx === history.length - 1}
            />
          ))}
        </ul>
      </div>
    </>
  );
}