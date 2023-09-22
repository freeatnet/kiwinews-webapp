import classNames from "classnames";

export type StoriesListProps =
  | {
      ordered?: false | undefined;
      children: React.ReactNode;
    }
  | {
      ordered: true;
      start?: number;
      children: React.ReactNode;
    };

export function StoriesList(props: StoriesListProps) {
  const { children, ordered } = props;
  const AsTag = ordered ? "ol" : "ul";
  const start = ordered ? props.start : undefined;

  return (
    <AsTag
      className={classNames(
        ordered && "list-decimal list-outside pl-10 marker:text-gray-500",
        "space-y-4",
      )}
      start={start}
    >
      {children}
    </AsTag>
  );
}
