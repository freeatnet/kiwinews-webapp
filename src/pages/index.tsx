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

        {/* Newsletter Box  */}
        <br />
        <hr className="mx-auto my-4 w-1/4 bg-gray-400 text-left" />
        <div className="mx-auto mb-8 max-w-4xl pr-4 pt-4 text-center text-xl">
          <b>
            Want to get a daily Kiwi Editor&apos;s Pick delivered to your inbox?
            <br />
            Subscribe to KiwiNews!
          </b>
          <br />
          <br />
          <form
            action="https://buttondown.email/api/emails/embed-subscribe/kiwinews"
            method="post"
            target="popupwindow"
            onSubmit={() =>
              window.open("https://buttondown.email/kiwinews", "popupwindow")
            }
            className="mx-auto flex max-w-xl items-center"
          >
            <input
              placeholder="your email"
              type="email"
              name="email"
              id="bd-email"
              className="box-border w-2/3 border-2 border-black p-1"
            />
            <input
              type="submit"
              value="Subscribe"
              className="box-border w-1/3 cursor-pointer border-2 border-black bg-gray-200 p-1 text-base"
            />
          </form>
        </div>
      </div>
    </>
  );
}
