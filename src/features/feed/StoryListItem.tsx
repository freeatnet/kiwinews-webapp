import { useCallback, useMemo } from "react";
import invariant from "ts-invariant";
import { useEnsName } from "wagmi";

import { formatAddressForDisplay } from "~/helpers";

import { extractDomain, formatTimeAgo } from "./helpers";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

function is0xAddress(address: string): address is `0x${string}` {
  return address.startsWith("0x");
}

function AddressOrEnsName({ address }: { address: string }) {
  invariant(is0xAddress(address), "address is required");
  const { data: ensName } = useEnsName({ address });

  return (
    <span title={`${address}`}>
      {formatAddressForDisplay(address, ensName)}
    </span>
  );
}

type StoryListItemProps = {
  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;
  poster: string;
  upvoters: string[];

  hasVoted?: boolean;
  onClickVote?: (href: string) => void;
};

const MAX_UPVOTERS_VISIBLE = 3;
export function StoryListItem({
  title,
  href,
  timestamp,
  // signature,
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
      <div className="flex flex-row items-baseline">
        <div className="mr-1 w-8">
          <button
            title={`upvote ${title}`}
            className="select-none rounded px-2 text-center text-2xl text-black transition-colors duration-100 hover:text-gray-900 active:bg-kiwi active:text-gray-900 disabled:cursor-not-allowed disabled:text-kiwi disabled:active:bg-inherit"
            onClick={handleClickVote}
            disabled={hasVoted}
          >
            ▲
          </button>
        </div>
        <div className="flex-1 text-xl">
          <div>
            <a
              href={href}
              target="_blank"
              className="visited:text-gray-500"
              rel="noopener noreferrer"
            >
              {title || "[untitled]"}
            </a>{" "}
            <span className="text-base text-gray-500">({displayDomain})</span>
          </div>
          <div className="flex flex-row items-baseline text-base">
            <div className="mr-2 text-base text-gray-500">
              <span title={`score ${score}`}>
                {points} {points != 1 ? "points" : "point"}
              </span>{" "}
              &bull;{" "}
              <time suppressHydrationWarning dateTime={isoTimestamp}>
                {timeAgo}
              </time>{" "}
              &bull;{" "}
              <span>
                upvoted by <AddressOrEnsName address={poster} />
              </span>{" "}
              {upvoters.length > 0 && (
                <span>
                  and{" "}
                  {upvoters.slice(0, MAX_UPVOTERS_VISIBLE).map((addr, idx) => (
                    <>
                      <AddressOrEnsName key={addr} address={addr} />
                      {idx < upvoters.length - 1 &&
                        idx < MAX_UPVOTERS_VISIBLE - 1 &&
                        ", "}
                    </>
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
