import classNames from "classnames";
import { useCallback, useMemo } from "react";

import { formatAddressForDisplay } from "~/helpers";

import { extractDomain, formatTimeAgo } from "./helpers";

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

export type StoryListItemProps = {
  rank?: number | null;

  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;
  poster: { address: `0x${string}`; displayName: string | null };
  upvoters: { address: `0x${string}`; displayName: string | null }[];

  hasVoted?: boolean;
  onClickVote?: (href: string) => void;
};

function RankLabel({ className, rank }: { className?: string; rank: number }) {
  return (
    <div
      className={classNames(
        className,
        "text-sm md:text-base text-medium saturate-50",
        rank === 1
          ? "text-yellow-500"
          : rank === 2
          ? "text-gray-500"
          : rank === 3
          ? "text-amber-600"
          : "text-gray-500"
      )}
    >
      #{rank}
    </div>
  );
}

const MAX_UPVOTERS_VISIBLE = 3;
export function StoryListItem({
  rank,

  title,
  href,
  timestamp,
  signature,
  points,
  score,
  poster,
  upvoters,

  hasVoted,
  onClickVote,
}: StoryListItemProps) {
  const displayDomain = useMemo(() => extractDomain(href), [href]);
  const isoTimestamp = useMemo(
    () => new Date(timestamp * 1000).toISOString(),
    [timestamp]
  );
  const timeAgo = useMemo(() => formatTimeAgo(timestamp), [timestamp]);

  const handleClickVote = useCallback(
    () => onClickVote?.(href),
    [href, onClickVote]
  );

  return (
    <li>
      <div className="flex flex-row">
        <div className="mr-2 text-center md:mr-3">
          <button
            title={`upvote ${title}`}
            className="group flex select-none flex-col items-center justify-start rounded border border-gray-200 px-3 py-2 text-center text-gray-500 transition-colors duration-100 disabled:cursor-not-allowed disabled:text-lime-300 disabled:active:bg-inherit group-hover:text-gray-900 group-active:bg-lime-100 group-active:text-gray-900"
            onClick={handleClickVote}
            disabled={hasVoted}
          >
            <span className="flex text-base leading-none">▲</span>
            <span className="flex text-sm font-medium" title={`score ${score}`}>
              {points}
            </span>
          </button>
          {!!rank && <RankLabel className="mt-1 block md:hidden" rank={rank} />}
        </div>
        <div className="flex-1 md:self-center">
          <div>
            <a
              href={href}
              target="_blank"
              className="visited:text-gray-500"
              rel="noopener noreferrer"
            >
              {title || "[untitled]"}
            </a>{" "}
            <span className="text-sm text-gray-500">({displayDomain})</span>
          </div>
          <div className="flex flex-row items-baseline text-sm">
            <div className="mr-2 text-sm text-gray-500">
              <time suppressHydrationWarning dateTime={isoTimestamp}>
                {timeAgo}
              </time>{" "}
              &bull;{" "}
              <span>
                by {formatAddressForDisplay(poster.address, poster.displayName)}
              </span>{" "}
              {upvoters.length > 0 && (
                <span>
                  and{" "}
                  {upvoters
                    .slice(0, MAX_UPVOTERS_VISIBLE)
                    .map(({ address, displayName }, idx) => (
                      <span key={address}>
                        {formatAddressForDisplay(address, displayName)}
                        {idx < upvoters.length - 1 &&
                          idx < MAX_UPVOTERS_VISIBLE - 1 &&
                          ", "}
                      </span>
                    ))}
                </span>
              )}
            </div>
            <StorySignatureStripe signature={signature} />
          </div>
        </div>
        {!!rank && (
          <RankLabel className="hidden self-center md:block" rank={rank} />
        )}
      </div>
    </li>
  );
}
