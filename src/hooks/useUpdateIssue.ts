import { updateIssue } from "@/service/github-api";
import type { Issue } from "@/types/issue";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UseUpdateIssue = {
  query: string;
  filter: "all" | "open" | "in progress" | "done";
  order: "asc" | "desc";
};

export const useUpdateIssue = ({ query, filter, order }: UseUpdateIssue) => {
  const queryClient = useQueryClient();
  const queryKey = ["issues", { query, filter, order }];

  return useMutation({
    mutationFn: updateIssue,
    onSuccess: async ({ updatedIssue }) => {
      await queryClient.cancelQueries(queryKey);
      const previousIssues =
        queryClient.getQueryData<InfiniteData<Issue[]>>(queryKey);

      queryClient.setQueryData(queryKey, {
        ...previousIssues,
        pages: previousIssues?.pages?.map((page) => {
          return page.map((issue) => {
            if (issue.number === updatedIssue.number) {
              return {
                ...issue,
                ...updatedIssue,
              };
            }
            return issue;
          });
        }),
      });
    },
  });
};
