import Head from "next/head";

import { StoriesList, StoryContainer } from "~/features/feed";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

const DEFAULT_STORIES_INPUT = {
  from: 0,
  amount: 25,
};

export const getStaticProps = withStaticAPIHelpers(async ({ trpc }) => {
  await trpc.new.stories.prefetch(DEFAULT_STORIES_INPUT);

  return {
    props: {}, // trpc state is serialized automatically by the wrapper
    revalidate: 60,
  };
});

export default function Home() {
  const { data: stories } = api.new.stories.useQuery(DEFAULT_STORIES_INPUT);

  return (
    <>
      <Head>
        <title>New on Kiwi News</title>
        <link
          rel="alternate"
          type="application/atom+xml"
          href="/api/feed/new"
        />
      </Head>
      <TopNav />
      <div className="mx-auto mb-8 max-w-4xl px-4 pt-4">
        <StoriesList>
          {stories?.map((story) => (
            <StoryContainer key={story.signature} {...story} />
          ))}
        </StoriesList>
      </div>
    </>
  );
}
