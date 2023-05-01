export type StoriesListProps = { children: React.ReactNode };

export function StoriesList({ children }: StoriesListProps) {
  return (
    <ol className="list-outside list-decimal space-y-1 pl-[3ch] marker:text-gray-500">
      {children}
    </ol>
  );
}
