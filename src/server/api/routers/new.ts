import invariant from "ts-invariant";
import { isAddress, isAddressEqual } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { miniProfileForAddress } from "~/server/services/miniprofile";

import { findAllNewStories } from "./queries/findAllNewStories.query";

const STORIES_INPUT_SCHEMA = z.object({
  from: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

export const newRouter = createTRPCRouter({
  stories: publicProcedure
    .input(STORIES_INPUT_SCHEMA)
    .query(async ({ input, ctx: { edgedbClient } }) => {
      const stories = await findAllNewStories(edgedbClient, {
        from: input.from,
        amount: input.amount,
      });

      const augmentedStories = await Promise.all(
        stories.map(
          async ({
            keyMessage: { identity: posterAddress, ...restKeyMessage },
            upvoters: upvoterAddresses,
            points,
          }) => {
            invariant(
              isAddress(posterAddress),
              `expected ${posterAddress} to be an address`,
            );

            const [poster, ...upvoters] = await Promise.all([
              miniProfileForAddress(posterAddress),
              ...upvoterAddresses
                .filter(isAddress)
                .filter((identity) => !isAddressEqual(identity, posterAddress))
                .map(miniProfileForAddress),
            ]);

            return {
              ...restKeyMessage,
              poster,
              upvoters,
              points,
              score: null,
            };
          },
        ),
      );

      return augmentedStories;
    }),
});
