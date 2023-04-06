import { deleteIssue } from "@/service/github-api/deleteIssue";
import { getIssuesData } from "@/utils/getIssuesData";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type UseDeleteIssue = {
  query: string;
  filter: "all" | "open" | "in progress" | "done";
  order: "asc" | "desc";
};

export const useDeleteIssue = ({ query, filter, order }: UseDeleteIssue) => {
  const queryClient = useQueryClient();
  const queryKey = ["issues", { query, order, filter }];

  return useMutation({
    mutationFn: deleteIssue,
    onSuccess: ({ deletedIssue }) => {
      const previousIssues = getIssuesData(queryClient, queryKey);

      queryClient.setQueryData(queryKey, {
        ...previousIssues,
        pages: previousIssues?.pages?.map((page) => {
          return page.filter((issue) => issue.number !== deletedIssue.number);
        }),
      });
    },
  });
};
