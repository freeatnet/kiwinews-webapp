import Head from "next/head";
import { useCallback } from "react";

import { StoriesList, StoryContainer } from "~/features/feed";
import { formatAddressForDisplay } from "~/helpers";
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
    trpc.home.editorsPicks.prefetch(),
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
  const { data: editorsPicks } = api.home.editorsPicks.useQuery();

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
      {!!editorsPicks && (
        <div className="bg-indigo-600/5 shadow shadow-indigo-400/10">
          <div className="mx-auto mb-4 max-w-4xl space-y-3 px-4 pb-8 pt-6">
            <h2 className="mb-2 font-semibold uppercase leading-8 tracking-tight text-indigo-600">
              Editor&apos;s picks by{" "}
              <span>
                {/* <img
                  src="https://pbs.twimg.com/profile_images/1676299741393453056/pjC1qAkc_400x400.jpg"
                  className="mr-1 inline-block h-4 w-4 rounded-full"
                /> */}
                {formatAddressForDisplay(
                  editorsPicks.editor.address,
                  editorsPicks.editor.displayName
                )}
              </span>
            </h2>
            <StoriesList>
              {editorsPicks.stories.map((story) => (
                <StoryContainer
                  {...story}
                  key={story.signature}
                  onUpvoteSubmitted={handleTopStoryUpvote}
                />
              ))}
            </StoriesList>
          </div>
        </div>
      )}

      <div className="mx-auto mb-8 max-w-4xl space-y-3 px-4 pt-4">
        <h2 className="mb-2 font-semibold uppercase leading-8 tracking-tight text-indigo-600">
          Top Stories
        </h2>
        <StoriesList>
          {topStories?.slice(0, 5).map((story, idx) => (
            <StoryContainer
              {...story}
              key={story.signature}
              rank={idx + 1}
              onUpvoteSubmitted={handleTopStoryUpvote}
            />
          ))}
        </StoriesList>
        <hr />

        <div>
          <h2 className="mb-2 font-semibold uppercase leading-8 tracking-tight text-gray-900/50">
            Please help rate these stories
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
        <hr />

        <StoriesList>
          {topStories?.slice(5).map((story) => (
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
