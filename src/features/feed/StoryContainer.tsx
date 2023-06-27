import { useConnectModal } from "@rainbow-me/rainbowkit";
import { TRPCClientError } from "@trpc/client";
import { signTypedData } from "@wagmi/core";
import { useCallback } from "react";
import { useAccount } from "wagmi";

import {
  STORY_EIP712_DOMAIN,
  STORY_EIP712_PRIMARY_TYPE,
  STORY_EIP712_TYPES,
  STORY_MESSAGE_TYPE,
} from "~/constants";
import { api } from "~/utils/api";

import { useVotingState } from "./hooks";
import { StoryListItem } from "./StoryListItem";

export type StoryContainerProps = {
  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;
  poster: string;
  upvoters: string[];

  onUpvoteSubmitted?: (href: string) => void;
};

export function StoryContainer({
  onUpvoteSubmitted,
  ...story
}: StoryContainerProps) {
  const { href, points } = story;

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();

  const { mutateAsync: postUpvote, isLoading: isSubmittingUpvote } =
    api.post.upvote.useMutation({
      onSuccess(_, variables) {
        onUpvoteSubmitted?.(variables.href);
      },
    });

  const votingKey = !!address
    ? `k7d:hasVoted:${address.toLowerCase()}:${href}`
    : undefined;
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
      primaryType: STORY_EIP712_PRIMARY_TYPE,
      message: {
        href,
        title: "",
        type: STORY_MESSAGE_TYPE,
        timestamp: BigInt(timestamp),
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
    }
  }, [href, markHasVoted, postUpvote, refetchHasVoted]);

  return (
    <StoryListItem
      {...story}
      points={points + Number(isSubmittingUpvote)}
      hasVoted={hasVoted || isSubmittingUpvote}
      onClickVote={isConnected ? handleUpvote : openConnectModal}
    />
  );
}
