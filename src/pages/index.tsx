import { BigNumber } from "@ethersproject/bignumber";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useMemo } from "react";
import { useSignTypedData } from "wagmi";

import {
  STORY_EIP712_DOMAIN,
  STORY_EIP712_TYPES,
  STORY_MESSAGE_TYPE,
} from "~/constants";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

function extractDomain(url: string) {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.startsWith("www.")
    ? parsedUrl.hostname.slice(4)
    : parsedUrl.hostname;
}

export const getStaticProps = withStaticAPIHelpers(async ({ trpc }) => {
  await trpc.home.stories.prefetch({ from: 0, amount: 10 });

  return {
    props: {}, // trpc state is serialized automatically by the wrapper
    revalidate: 60,
  };
});

function StoriesList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-outside list-decimal space-y-1 pl-6 marker:text-gray-500 lg:pl-0">
      {children}
    </ol>
  );
}

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() / 1000 - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 60 / 60);
  if (hours < 24) {
    return `${hours} ${hours != 1 ? "hours" : "hour"} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${days != 1 ? "days" : "day"} ago`;
}

function StorySignatureStripe({ signature }: { signature: string }) {
  const signatureBlocks = useMemo(() => {
    const colors = signature.slice(2).match(/.{4,6}/g) ?? [];

    return colors.map((color) => color);
  }, [signature]);

  return (
    <div className="flex flex-row [&>div]:relative [&>div]:h-1 [&>div]:w-1 [&>div]:opacity-70">
      {signatureBlocks.map((c, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: `#${c}`,
          }}
        ></div>
      ))}
    </div>
  );
}

function Story({
  title,
  href,
  timestamp,
  signature,
  points,
  score,
}: {
  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;
}) {
  const displayDomain = useMemo(() => extractDomain(href), [href]);
  const isoTimestamp = useMemo(
    () => new Date(timestamp).toISOString(),
    [timestamp]
  );
  const timeAgo = useMemo(() => formatTimeAgo(timestamp), [timestamp]);

  const { mutateAsync: postUpvote } = api.post.upvote.useMutation();
  const { signTypedDataAsync } = useSignTypedData({
    domain: STORY_EIP712_DOMAIN,
    types: STORY_EIP712_TYPES,
    onError: (error) => {
      console.error(error);
    },
  });

  const handleUpvote = useCallback(async () => {
    const timestamp = Math.trunc(Date.now() / 1000);

    const signature = await signTypedDataAsync({
      value: {
        href,
        title: "",
        type: STORY_MESSAGE_TYPE,
        timestamp: BigNumber.from(timestamp),
      },
    });

    const response = await postUpvote({
      href,
      title: "",
      type: STORY_MESSAGE_TYPE,
      timestamp,
      signature,
    });

    // eslint-disable-next-line no-console -- TODO: remove
    console.log(response);
  }, [href, postUpvote, signTypedDataAsync]);

  return (
    <li>
      <div className="flex flex-row">
        <div className="mr-1">
          <button
            title={`upvote ${title}`}
            className="px-2 text-sm text-gray-500 transition-colors duration-100 hover:text-gray-900 active:text-gray-900"
            onClick={() => void handleUpvote()}
          >
            ▲
          </button>
        </div>
        <div>
          <div>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {title || "[untitled]"}
            </a>{" "}
            <span className="text-sm text-gray-500">({displayDomain})</span>
          </div>
          <div className="flex flex-row items-baseline text-sm">
            <div className="mr-2 text-sm text-gray-500">
              <span title={`score ${score}`}>{points} points</span> &bull;{" "}
              <time dateTime={isoTimestamp}>{timeAgo}</time>
            </div>
            <StorySignatureStripe signature={signature} />
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Home() {
  const { data: stories } = api.home.stories.useQuery({
    from: 0,
    amount: 25,
  });

  return (
    <>
      <div className="flex h-16 w-full justify-center">
        <div className="flex max-w-5xl flex-1 items-center justify-end">
          <ConnectButton
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-4 lg:px-0">
        <StoriesList>
          {stories?.map((story) => (
            <Story key={story.signature} {...story} />
          ))}
        </StoriesList>
      </div>
    </>
  );
}
