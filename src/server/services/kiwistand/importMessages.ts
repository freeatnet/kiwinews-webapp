/* eslint-disable no-console */
import { env } from "~/env.mjs";
import { client as edgedbClient } from "~/server/config/edgedb";

import { fetchMessages } from "./fetchMessages";
import { countAllMessages } from "./queries/countAllMessages.query";
import { insertManyMessages } from "./queries/insertManyMessages.query";

const KIWISTAND_MAX_MESSAGES_PER_PAGE = env.KIWISTAND_MESSAGES_MAX_PAGE_SIZE;

export async function importMessages() {
  const runId = Math.random().toString(36).slice(2, 8);

  console.time(`[${runId}] importMessages countAllMessages`);
  let from = await countAllMessages(edgedbClient);
  console.timeEnd(`[${runId}] importMessages countAllMessages`);

  console.time(`[${runId}] importMessages fetch-insert loop`);
  for (from; true; from += KIWISTAND_MAX_MESSAGES_PER_PAGE) {
    console.time(`[${runId}] importMessages fetchMessages from=${from}`);
    const messages = await fetchMessages(from, KIWISTAND_MAX_MESSAGES_PER_PAGE);
    console.timeEnd(`[${runId}] importMessages fetchMessages from=${from}`);

    console.time(`[${runId}] importMessages insertManyMessages from=${from}`);
    await insertManyMessages(edgedbClient, { messages });
    console.timeEnd(
      `[${runId}] importMessages insertManyMessages from=${from}`,
    );

    if (messages.length === 0) {
      break;
    }
  }
  console.timeEnd(`[${runId}] importMessages fetch-insert loop`);
}
