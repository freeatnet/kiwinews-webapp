import { hashTypedData } from "viem";

import {
  STORY_EIP712_DOMAIN,
  STORY_EIP712_PRIMARY_TYPE,
  STORY_EIP712_TYPES,
} from "~/constants";

export function getStoryTypedHash({
  timestamp,
  ...restStory
}: {
  type: "amplify";
  title: string;
  href: string;
  timestamp: number;
}) {
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
