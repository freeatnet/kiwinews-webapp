import { useCallback, useMemo } from "react";

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

type StoryListItemProps = {
  title: string;
  href: string;
  timestamp: number;
  points: number;
  score: number;
  signature: string;

  hasVoted?: boolean;
  onClickVote?: (href: string) => void;
};

export function StoryListItem({
  title,
  href,
  timestamp,
  signature,
  points,
  score,

  hasVoted,
  onClickVote,
}: StoryListItemProps) {
  const displayDomain = useMemo(() => extractDomain(href), [href]);
  const isoTimestamp = useMemo(
    () => new Date(timestamp).toISOString(),
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
        <div className="mr-1">
          <button
            title={`upvote ${title}`}
            className="px-2 text-sm text-gray-500 transition-colors duration-100 hover:text-gray-900 active:text-gray-900 disabled:cursor-not-allowed disabled:text-lime-300"
            onClick={handleClickVote}
            disabled={hasVoted}
          >
            ▲
          </button>
        </div>
        <div>
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
              <span title={`score ${score}`}>{points} points</span> &bull;{" "}
              <time dateTime={isoTimestamp}>{timeAgo}</time>
            </div>
            <StorySignatureStripe signature={signature} />
          </div>
        </div>
      </div>
    </li>
  );
}
