import { useConnectModal } from "@rainbow-me/rainbowkit";
import { signTypedData } from "@wagmi/core";
import { useCallback, useMemo, useState } from "react";
import { isAddressEqual } from "viem";
import { useAccount, useEnsName } from "wagmi";

import {
  STORY_EIP712_DOMAIN,
  STORY_EIP712_PRIMARY_TYPE,
  STORY_EIP712_TYPES,
  STORY_MESSAGE_TYPE,
} from "~/constants";
import { api } from "~/utils/api";

import { StoryListItem, type StoryListItemProps } from "./StoryListItem";

export type StoryContainerProps = {
  rank?: StoryListItemProps["rank"];

  title: string;
  href: string;
  timestamp: number;
  points: number;
  score?: number | null;
  signature: string;
  poster: { address: `0x${string}`; displayName: string | null };
  upvoters: { address: `0x${string}`; displayName: string | null }[];
  messageId: string;

  onUpvoteSubmitted?: (href: string) => void;
};

export function StoryContainer({
  onUpvoteSubmitted,
  ...story
}: StoryContainerProps) {
  const { href, points, upvoters, poster } = story;

  // `viewer` is a workaround for the fact that the server does not know the currently connected account
  // and `useAccount` returned the connected address immediately, causing server/client mismatch
  const [viewer, setViewer] = useState<`0x${string}` | undefined>(undefined);
  useAccount({
    onConnect: ({ address }) => {
      setViewer(address);
    },
    onDisconnect: () => {
      setViewer(undefined);
    },
  });

  // determines if the viewer has already voted on the story
  const hasViewerVoted = useMemo(
    () =>
      !!viewer &&
      (isAddressEqual(viewer, poster.address) ||
        upvoters.some(({ address }) => isAddressEqual(viewer, address))),
    [viewer, poster.address, upvoters]
  );

  // permalink
  const { messageId } = story;
  const permalinkPath = useMemo(() => `/s/${messageId}`, [messageId]);

  // rest is related to upvote submission
  const { openConnectModal } = useConnectModal();
  const { isConnected } = useAccount();

  const {
    mutateAsync: postUpvote,
    isLoading: isSubmittingUpvote,
    isSuccess: didSubmitUpvote,
  } = api.post.upvote.useMutation({
    onSuccess(_, variables) {
      onUpvoteSubmitted?.(variables.href);
    },
  });

  const handleClickUpvote = useCallback(async () => {
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

    const response = await postUpvote({
      href,
      title: "",
      type: STORY_MESSAGE_TYPE,
      timestamp,
      signature,
    });

    // eslint-disable-next-line no-console -- TODO: remove
    console.log(response);
  }, [href, postUpvote]);

  const hasJustVoted =
    (isSubmittingUpvote || didSubmitUpvote) && !hasViewerVoted;

  const { data: viewerEns } = useEnsName({
    address: viewer,
    enabled: !!viewer && (isSubmittingUpvote || didSubmitUpvote),
  });
  const optimisticUpvoters = useMemo(
    () =>
      // add the viewer to the upvoters list if they haven't voted yet
      hasJustVoted && !!viewer
        ? upvoters.concat([{ address: viewer, displayName: viewerEns ?? null }])
        : upvoters,
    [hasJustVoted, upvoters, viewer, viewerEns]
  );

  return (
    <StoryListItem
      {...story}
      permalinkPath={permalinkPath}
      points={
        // add a point if the mutation is in progress or just completed, but not when
        // the viewer is already in the upvoters list
        points + Number(hasJustVoted)
      }
      upvoters={optimisticUpvoters}
      hasVoted={hasViewerVoted || isSubmittingUpvote || didSubmitUpvote}
      onClickVote={isConnected ? handleClickUpvote : openConnectModal}
    />
  );
}
