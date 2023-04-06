import { createIssue } from "@/service/github-api";
import { getIssuesData } from "@/utils/getIssuesData";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateIssue = () => {
  const queryKey = ["issues", { query: "", order: "desc", filter: "all" }];
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIssue,
    onError: (err, newIssue, context) => {
      // TODO: Alert something
    },
    onSuccess: ({ newIssue }) => {
      const previousIssues = getIssuesData(queryClient, queryKey);

      queryClient.setQueryData(queryKey, {
        ...previousIssues,
        pages: previousIssues?.pages?.map((page, index) => {
          if (index !== 0) {
            return page;
          }
          return [{ ...newIssue, label: "open" }, ...page];
        }) ?? [[newIssue]],
      });
    },
  });
};
