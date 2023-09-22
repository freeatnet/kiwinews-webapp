import { isAddress } from "viem";
import { z } from "zod";

import { env } from "~/env.mjs";

import { getMessageId } from "./getMessageId";

const KIWISTAND_LIST_STORIES_URL = new URL(
  `/api/v1/list`,
  env.KIWISTAND_API_HOST,
).toString();

const MESSAGE_SCHEMA = z
  .object({
    title: z.string(),
    href: z.string().url(),
    type: z.literal("amplify"),
    timestamp: z.number(),
    signature: z.string(),
    signer: z.string().refine(isAddress, {
      message: "Must be a valid address",
    }),
    identity: z.string().refine(isAddress, {
      message: "Must be a valid address",
    }),
  })
  .transform((message) => {
    const messageId = getMessageId(message);

    return {
      ...message,
      messageId,
    };
  });

const MESSAGES_API_RESPONSE_SCHEMA = z.object({
  data: z.array(MESSAGE_SCHEMA),
});

export async function fetchMessages(from: number, amount: number) {
  const request = await fetch(KIWISTAND_LIST_STORIES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      amount,
    }),
  });

  if (!request.ok) {
    const responseText = await request.text();
    const cause = {
      status: request.status,
      statusText: request.statusText,
      bodyText: responseText,
    };

    console.error("could not fetch messages", cause);
    throw new Error("could not fetch messages", { cause });
  }

  const responseJson = await request.json();

  const { data } = MESSAGES_API_RESPONSE_SCHEMA.parse(responseJson);
  return data;
}
