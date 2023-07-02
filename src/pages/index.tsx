import Head from "next/head";
import { useCallback } from "react";

import { StoriesList, StoryContainer } from "~/features/feed";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

const TOP_STORIES_INPUT = {
  from: 0,
  amount: 25,
};

const NEW_STORIES_INPUT = {
  from: 0,
  amount: 3,
};

export const getStaticProps = withStaticAPIHelpers(async ({ trpc }) => {
  await Promise.all([
    trpc.home.topStories.prefetch(TOP_STORIES_INPUT),
    trpc.home.newStories.prefetch(NEW_STORIES_INPUT),
  ]);

  return {
    props: {}, // trpc state is serialized automatically by the wrapper
    revalidate: 60,
  };
});

export default function Home() {
  const { data: topStories, refetch: refetchTopStories } =
    api.home.topStories.useQuery(TOP_STORIES_INPUT);
  const { data: newStories, refetch: refetchNewStories } =
    api.home.newStories.useQuery(NEW_STORIES_INPUT);

  const handleTopStoryUpvote = useCallback(
    (_href: string) => void refetchTopStories(),
    [refetchTopStories]
  );

  const handleNewStoryUpvote = useCallback(
    (_href: string) => {
      void refetchTopStories();
      void refetchNewStories();
    },
    [refetchNewStories, refetchTopStories]
  );

  return (
    <>
      <Head>
        <title>New on Kiwi News</title>
        <link
          rel="alternate"
          type="application/atom+xml"
          href="/api/feed/top"
        />
      </Head>
      <TopNav />
      <div className="mx-auto mb-8 max-w-4xl pr-4 pt-4">
        <StoriesList ordered>
          {topStories?.slice(0, 3).map((story) => (
            <StoryContainer
              {...story}
              key={story.signature}
              onUpvoteSubmitted={handleTopStoryUpvote}
            />
          ))}
        </StoriesList>
        <hr className="my-3" />
        <div className="pl-10">
          <h2 className="mb-2 text-gray-500">
            Please help rate these stories:
          </h2>
          <StoriesList>
            {newStories?.map((story) => (
              <StoryContainer
                {...story}
                key={story.signature}
                onUpvoteSubmitted={handleNewStoryUpvote}
              />
            ))}
          </StoriesList>
        </div>
        <hr className="my-3" />
        <StoriesList ordered start={4}>
          {topStories?.slice(3).map((story) => (
            <StoryContainer
              {...story}
              key={story.signature}
              onUpvoteSubmitted={handleTopStoryUpvote}
            />
          ))}
        </StoriesList>
      </div>
    </>
  );
}
