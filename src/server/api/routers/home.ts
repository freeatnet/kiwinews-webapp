import invariant from "ts-invariant";
import { isAddress, isAddressEqual } from "viem";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { fetchEditorsPicks } from "~/server/services/kiwinews";
import { miniProfileForAddress } from "~/server/services/miniprofile";

import { findAllNewStories } from "./queries/findAllNewStories.query";
import { findAllTopStories } from "./queries/findAllTopStories.query";
import { findStoriesByHrefs } from "./queries/findStoriesByHrefs.query";

const STORIES_INPUT_SCHEMA = z.object({
  from: z.number().nonnegative(),
  amount: z.number().nonnegative(),
});

export const homeRouter = createTRPCRouter({
  /**
   * Returns a list of "top" stories.
   * Rules:
   *   - story must have at least 2 points
   *   - stories with more points are ranked higher, subject to the decay factor
   */
  topStories: publicProcedure
    .input(STORIES_INPUT_SCHEMA)
    .query(async ({ input, ctx: { edgedbClient } }) => {
      const stories = await findAllTopStories(edgedbClient, {
        from: input.from,
        amount: input.amount,
      });

      const augmentedStories = await Promise.all(
        stories.map(
          async ({
            keyMessage: { identity: posterAddress, ...restKeyMessage },
            upvoters: upvoterAddresses,
            points,
            score,
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
              score,
            };
          },
        ),
      );

      return augmentedStories;
    }),

  /**
   * Returns a list of "new" stories.
   * Rules:
   *  - story must have at most 1 point
   *  - stories are returned in reverse chronological order (latest first)
   */
  newStories: publicProcedure
    .input(STORIES_INPUT_SCHEMA)
    .query(async ({ input, ctx: { edgedbClient } }) => {
      // TODO: only fetch stories with at most 1 point
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
              score: restKeyMessage.timestamp,
            };
          },
        ),
      );

      return augmentedStories;
    }),

  /**
   * Returns "Editors' Picks"
   */
  editorsPicks: publicProcedure.query(async ({ ctx: { edgedbClient } }) => {
    const editorsPicks = await fetchEditorsPicks();

    if (!editorsPicks) {
      return null;
    }

    const [editorsProfile, editorsStories] = await Promise.all([
      miniProfileForAddress(editorsPicks.editor.address),
      (async function (links: string[]) {
        const stories = await findStoriesByHrefs(edgedbClient, {
          hrefs: links,
        });

        const augmentedStories = await Promise.all(
          stories.map(
            async (
              {
                keyMessage: { identity: posterAddress, ...restKeyMessage },
                upvoters: upvoterAddresses,
                points,
              },
              idx,
            ) => {
              invariant(
                isAddress(posterAddress),
                `expected ${posterAddress} to be an address`,
              );

              const [poster, ...upvoters] = await Promise.all([
                miniProfileForAddress(posterAddress),
                ...upvoterAddresses
                  .filter(isAddress)
                  .filter(
                    (identity) => !isAddressEqual(identity, posterAddress),
                  )
                  .map(miniProfileForAddress),
              ]);

              return {
                ...restKeyMessage,
                poster,
                upvoters,
                points,
                score: idx,
              };
            },
          ),
        );

        return augmentedStories;
      })(editorsPicks.links.map(({ link }) => link)),
    ]);

    return {
      editor: editorsProfile,
      stories: editorsStories,
    };
  }),
});
