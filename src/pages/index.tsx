import { BigNumber } from "@ethersproject/bignumber";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { signTypedData } from "@wagmi/core";
import { useCallback, useMemo } from "react";
import invariant from "ts-invariant";
import { useAccount } from "wagmi";

import {
  STORY_EIP712_DOMAIN,
  STORY_EIP712_TYPES,
  STORY_MESSAGE_TYPE,
} from "~/constants";
import { TopNav } from "~/layout";
import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

function extractDomain(url: string) {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.startsWith("www.")
    ? parsedUrl.hostname.slice(4)
    : parsedUrl.hostname;
}

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

function StoriesList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-outside list-decimal space-y-1 pl-[3ch] marker:text-gray-500">
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

function useVotingState({ key }: { key: string }) {
  const { data, refetch } = useQuery({
    queryKey: [key],
    queryFn: ({ queryKey: [key] }) => {
      invariant(!!key, "empty key when fetching hasVoted");
      return localStorage.getItem(key) === "true";
    },
  });

  const { mutate } = useMutation({
    // eslint-disable-next-line @typescript-eslint/require-await
    mutationFn: async (state: boolean) => {
      localStorage.setItem(key, state ? "true" : "false");
    },
    onSettled: async () => await refetch(),
  });

  return { data, refetch, mutate };
}

type StoryListItemProps = {
  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;

  hasVoted?: boolean;
  onClickVote?: (href: string) => void;
};

function StoryListItem({
  title,
  href,
  timestamp,
  signature,
  points,
  score,

  hasVoted,
  onClickVote,
}: StoryListItemProps) {
  const displayDomain = useMemo(() => extractDomain(href), [href]);
  const isoTimestamp = useMemo(
    () => new Date(timestamp).toISOString(),
    [timestamp]
  );
  const timeAgo = useMemo(() => formatTimeAgo(timestamp), [timestamp]);

  const handleClickVote = useCallback(
    () => onClickVote?.(href),
    [href, onClickVote]
  );

  return (
    <li>
      <div className="flex flex-row">
        <div className="mr-1">
          <button
            title={`upvote ${title}`}
            className="px-2 text-sm text-gray-500 transition-colors duration-100 hover:text-gray-900 active:text-gray-900 disabled:cursor-not-allowed disabled:text-lime-300"
            onClick={handleClickVote}
            disabled={hasVoted}
          >
            ▲
          </button>
        </div>
        <div>
          <div>
            <a
              href={href}
              target="_blank"
              className="visited:text-gray-500"
              rel="noopener noreferrer"
            >
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

function Story({
  ...story
}: {
  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;
}) {
  const { href, points } = story;

  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { mutateAsync: postUpvote, isLoading: isSubmittingUpvote } =
    api.post.upvote.useMutation();
  const utils = api.useContext();

  const votingKey = `k7d:hasVoted:${href}`;
  const {
    data: hasVoted,
    refetch: refetchHasVoted,
    mutate: markHasVoted,
  } = useVotingState({
    key: votingKey,
  });

  const handleUpvote = useCallback(async () => {
    const timestamp = Math.trunc(Date.now() / 1000);

    const signature = await signTypedData({
      domain: STORY_EIP712_DOMAIN,
      types: STORY_EIP712_TYPES,
      value: {
        href,
        title: "",
        type: STORY_MESSAGE_TYPE,
        timestamp: BigNumber.from(timestamp),
      },
    });

    try {
      const response = await postUpvote({
        href,
        title: "",
        type: STORY_MESSAGE_TYPE,
        timestamp,
        signature,
      });

      // eslint-disable-next-line no-console -- TODO: remove
      console.log(response);

      markHasVoted(true);
    } catch (error) {
      if (
        error instanceof TRPCClientError &&
        error.message.match(/It was probably submitted and accepted before/)
      ) {
        markHasVoted(true);
        return;
      }

      throw error;
    } finally {
      void refetchHasVoted();
      void utils.home.stories.invalidate();
    }
  }, [href, markHasVoted, postUpvote, refetchHasVoted, utils.home.stories]);

  return (
    <StoryListItem
      {...story}
      points={points + Number(isSubmittingUpvote)}
      hasVoted={hasVoted || isSubmittingUpvote}
      onClickVote={isConnected ? handleUpvote : openConnectModal}
    />
  );
}

export default function Home() {
  const { data: stories } = api.home.stories.useQuery(DEFAULT_STORIES_INPUT);

  return (
    <>
      <TopNav />
      <div className="mx-auto mb-8 max-w-4xl pr-4 pt-4">
        <StoriesList>
          {stories?.map((story) => (
            <Story key={story.signature} {...story} />
          ))}
        </StoriesList>
      </div>
    </>
  );
}
