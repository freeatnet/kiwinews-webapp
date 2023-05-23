import Head from "next/head";

import { StoriesList, StoryContainer } from "~/features/feed";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

import SubscribeForm from "../features/newsletter/subscribe_form";

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
      <TopNav />
      <Head>
        <title>New on Kiwi News</title>
      </Head>
      <div className="mx-auto mb-8 max-w-4xl px-4 pt-4">
        <StoriesList>
          {stories?.map((story) => (
            <StoryContainer key={story.signature} {...story} />
          ))}
        </StoriesList>
        <SubscribeForm />
      </div>
    </>
  );
}
