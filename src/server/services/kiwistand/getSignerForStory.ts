import { _TypedDataEncoder } from "@ethersproject/hash";
import { recoverAddress } from "@ethersproject/transactions";
import invariant from "ts-invariant";

import { STORY_EIP712_DOMAIN, type STORY_EIP712_TYPES } from "~/constants";
import { is0xAddress } from "~/utils/viem";

import { type Story } from "./fetchAllStories";

// HACK: copy of `STORY_EIP712_TYPES` in a way that's compatible with `_TypedDataEncoder.hash`'s dislike of readonly types
const RETYPED_STORY_EIP712_TYPES = {
  Message: [
    { name: "title", type: "string" },
    { name: "href", type: "string" },
    { name: "type", type: "string" },
    { name: "timestamp", type: "uint256" },
  ],
} satisfies typeof STORY_EIP712_TYPES; // satisfies typeof ensures type equality: if either side changes, this will fail to compile

function getStoryDigest(story: Story) {
  return _TypedDataEncoder.hash(
    STORY_EIP712_DOMAIN,
    RETYPED_STORY_EIP712_TYPES,
    story
  );
}

export function getSignerFromStory(story: Story) {
  const recovered = recoverAddress(getStoryDigest(story), story.signature);
  invariant(is0xAddress(recovered), "invalid recovered address");
  return recovered;
}
