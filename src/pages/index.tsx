import { StoriesList, StoryContainer } from "~/features/feed";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

const DEFAULT_STORIES_INPUT = {
  from: 0,
  amount: 25,
};

export const getStaticProps = withStaticAPIHelpers(async ({ trpc }) => {
  await trpc.home.stories.prefetch(DEFAULT_STORIES_INPUT);

  return {
    props: {}, // trpc state is serialized automatically by the wrapper
    revalidate: 60,
  };
});

export default function Home() {
  const { data: stories } = api.home.stories.useQuery(DEFAULT_STORIES_INPUT);

  return (
    <>
      <TopNav />
      <div className="mx-auto mb-8 max-w-4xl pr-4 pt-4">
        <StoriesList>
          {stories?.map((story) => (
            <StoryContainer key={story.signature} {...story} />
          ))}
        </StoriesList>
      </div>
    </>
  );
}
