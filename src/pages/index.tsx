import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMemo } from "react";

import { api } from "~/utils/api";
import { withStaticAPIHelpers } from "~/utils/api/ssg";

function extractDomain(url: string) {
  const parsedUrl = new URL(url);
  return parsedUrl.hostname.startsWith("www.")
    ? parsedUrl.hostname.slice(4)
    : parsedUrl.hostname;
}

export const getStaticProps = withStaticAPIHelpers(async ({ trpc }) => {
  await trpc.home.stories.prefetch({ from: 0, amount: 10 });

  return {
    props: {}, // trpc state is serialized automatically by the wrapper
    revalidate: 60,
  };
});

function StoriesList({ children }: { children: React.ReactNode }) {
  return (
    <ol className="list-outside list-decimal space-y-1 pl-6 marker:text-gray-500 lg:pl-0">
      {children}
    </ol>
  );
}

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() / 1000 - new Date(timestamp).getTime();
  const hours = Math.floor(diff / 60 / 60);
  if (hours < 24) {
    return `${hours} ${hours != 1 ? "hours" : "hour"} ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${days != 1 ? "days" : "day"} ago`;
}

function StorySignatureStripe({ signature }: { signature: string }) {
  const signatureBlocks = useMemo(() => {
    const colors = signature.slice(2).match(/.{4,6}/g) ?? [];

    return colors.map((color) => color);
  }, [signature]);

  return (
    <div className="flex flex-row [&>div]:relative [&>div]:h-1 [&>div]:w-1 [&>div]:opacity-70">
      {signatureBlocks.map((c, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: `#${c}`,
          }}
        ></div>
      ))}
    </div>
  );
}

function Story({
  title,
  href,
  timestamp,
  signature,
  points,
  score,
}: {
  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;
}) {
  const displayDomain = useMemo(() => extractDomain(href), [href]);
  const isoTimestamp = useMemo(
    () => new Date(timestamp).toISOString(),
    [timestamp]
  );
  const timeAgo = useMemo(() => formatTimeAgo(timestamp), [timestamp]);

  return (
    <li>
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {title || "[untitled]"}
        </a>{" "}
        <span className="text-sm text-gray-500">({displayDomain})</span>
      </div>

      <div className="flex flex-row items-baseline text-sm">
        <div className="mr-2 text-sm text-gray-500">
          <span title={`score ${score}`}>{points} points</span> &bull;{" "}
          <time dateTime={isoTimestamp}>{timeAgo}</time>
        </div>
        <StorySignatureStripe signature={signature} />
      </div>
    </li>
  );
}

export default function Home() {
  const { data: stories } = api.home.stories.useQuery({
    from: 0,
    amount: 25,
  });

  return (
    <>
      <div className="flex h-16 w-full justify-center">
        <div className="flex max-w-5xl flex-1 items-center justify-end">
          <ConnectButton
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
      <div className="mx-auto mb-8 max-w-5xl px-4 pt-4 lg:px-0">
        <StoriesList>
          {stories?.map((story) => (
            <Story key={story.signature} {...story} />
          ))}
        </StoriesList>
      </div>
    </>
  );
}
