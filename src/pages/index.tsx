import Head from "next/head";
import { useCallback } from "react";

import { StoriesList, StoryContainer } from "~/features/feed";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

import SubscribeForm from "./susbscribe_form";

// Constant for freeatnet to call the API - we get 3 stories

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EDITORS_STORIES = [
  {
    editor_name: "...",
    editor_wallet: "...",
    editor_profile: "http://...",
    title: "...",
    title_link: "http://...",
  },
];

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
  // const { data: newStories, refetch: refetchNewStories } =
  //   api.home.newStories.useQuery(NEW_STORIES_INPUT);

  const handleTopStoryUpvote = useCallback(
    (_href: string) => void refetchTopStories(),
    [refetchTopStories]
  );

  // const handleNewStoryUpvote = useCallback(
  //   (_href: string) => {
  //     void refetchTopStories();
  //     void refetchNewStories();
  //   },
  //   [refetchNewStories, refetchTopStories]
  // );

  return (
    <>
      <TopNav />
      <Head>
        <title>Kiwi News</title>
      </Head>
      {/* Editor's Picks section */}
      <div className="mx-auto mb-8 max-w-4xl bg-kiwi/20 pr-4 pt-4 text-xl">
        <b>Editor&apos;s Picks: </b>
        <p>test</p>
      </div>

      {/* Community Picks section */}
      <div className="mx-auto mb-8 max-w-4xl pr-4 pt-4 text-xl">
        <b>Community&apos;s Picks: </b>
      </div>
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
        <StoriesList ordered start={4}>
          {topStories?.slice(3).map((story) => (
            <StoryContainer
              {...story}
              key={story.signature}
              onUpvoteSubmitted={handleTopStoryUpvote}
            />
          ))}
        </StoriesList>
        <SubscribeForm />
      </div>
    </>
  );
}
