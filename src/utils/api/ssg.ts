import type { ParsedUrlQuery } from "node:querystring";

import { type DehydratedState } from "@tanstack/react-query";
import { createServerSideHelpers as _createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
  PreviewData,
} from "next";
import superjson from "superjson";

import { type AppRouter, appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";

type CreateServerSideHelpers = ReturnType<
  typeof _createServerSideHelpers<AppRouter>
>;

/**
 * Creates a mostly-configured set of server-side helpers for tRPC.
 * @see https://trpc.io/docs/nextjs/server-side-helpers
 * @param innerContextOpts TRPC context opts
 * @returns TRPC helpers
 */
export function createServerSideHelpers(
  innerContextOpts: Parameters<typeof createInnerTRPCContext>[0]
): CreateServerSideHelpers {
  return _createServerSideHelpers<AppRouter>({
    router: appRouter,
    ctx: createInnerTRPCContext(innerContextOpts),
    transformer: superjson,
  });
}

type GetServerSidePropsContextWithTRPC<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetServerSidePropsContext<Q, D> & {
  trpc: CreateServerSideHelpers;
};

/**
 * A high-order function that wraps a `getServerSideProps` and providers
 * TRPC helpers in the context and automatically dehydrates the TRPC state
 * before returning.
 */
export function withServerSideAPIHelpers<P>(
  handler: (
    context: GetServerSidePropsContextWithTRPC
  ) => Promise<GetServerSidePropsResult<P>>
) {
  return async function getServerSidePropsWithTRPC(
    context: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P & { trpcState: DehydratedState }>> {
    const trpc = createServerSideHelpers({});

    const returnValue = await handler({ ...context, trpc });

    if ("redirect" in returnValue || "notFound" in returnValue) {
      return returnValue;
    }

    const resolvedProps = await returnValue.props;

    return {
      ...returnValue,
      props: {
        ...resolvedProps,
        trpcState: trpc.dehydrate(),
      },
    };
  };
}

type GetStaticPropsContextWithTRPC<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetStaticPropsContext<Q, D> & {
  trpc: CreateServerSideHelpers;
};

/**
 * A high-order function that wraps a `getStaticProps` and providers
 * TRPC helpers in the context and automatically dehydrates the TRPC state
 * before returning.
 */
export function withStaticAPIHelpers<P>(
  handler: (
    context: GetStaticPropsContextWithTRPC
  ) => Promise<GetStaticPropsResult<P>>
) {
  return async function getStaticPropsWithTRPC(
    context: GetStaticPropsContext
  ): Promise<GetStaticPropsResult<P & { trpcState: DehydratedState }>> {
    const trpc = createServerSideHelpers({});

    const returnValue = await handler({ ...context, trpc });

    if ("redirect" in returnValue || "notFound" in returnValue) {
      return returnValue;
    }

    const resolvedProps = returnValue.props;

    return {
      ...returnValue,
      props: {
        ...resolvedProps,
        trpcState: trpc.dehydrate(),
      },
    };
  };
}
