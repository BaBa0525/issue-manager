import type { Issue } from "@/types/issue";
import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

export const getIssuesData = (queryClient: QueryClient, queryKey: QueryKey) => {
  const previousIssues =
    queryClient.getQueryData<InfiniteData<Issue[]>>(queryKey);

  return previousIssues;
};
