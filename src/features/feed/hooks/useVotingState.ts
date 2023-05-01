import { useMutation, useQuery } from "@tanstack/react-query";
import invariant from "ts-invariant";

export function useVotingState({ key }: { key: string | undefined }) {
  const { data, refetch } = useQuery({
    enabled: !!key,
    queryKey: [key],
    queryFn: ({ queryKey: [key] }) => {
      invariant(!!key, "empty key when fetching hasVoted");
      return localStorage.getItem(key) === "true";
    },
  });

  const { mutate } = useMutation({
    // eslint-disable-next-line @typescript-eslint/require-await
    mutationFn: async (state: boolean) => {
      invariant(!!key, "empty key when mutating hasVoted");
      localStorage.setItem(key, state ? "true" : "false");
    },
    onSettled: async () => await refetch(),
  });

  return { data, refetch, mutate };
}
