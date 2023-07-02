import invariant from "ts-invariant";
import { hashTypedData, recoverAddress } from "viem";

import {
  STORY_EIP712_DOMAIN,
  STORY_EIP712_PRIMARY_TYPE,
  STORY_EIP712_TYPES,
} from "~/constants";
import { is0xString } from "~/utils/viem";

import { type Story } from "./fetchAllStories";

function getStoryTypedHash({ timestamp, ...restStory }: Story) {
  return hashTypedData({
    domain: STORY_EIP712_DOMAIN,
    types: STORY_EIP712_TYPES,
    primaryType: STORY_EIP712_PRIMARY_TYPE,
    message: {
      ...restStory,
      timestamp: BigInt(timestamp),
    },
  });
}

export async function getSignerFromStory(story: Story) {
  const { signature } = story;
  invariant(is0xString(signature), "expected signature to be a 0x string");

  const recovered = await recoverAddress({
    hash: getStoryTypedHash(story),
    signature,
  });
  return recovered;
}
