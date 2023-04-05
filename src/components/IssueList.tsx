import { getIssue } from "@/service/github-api";
import { type Issue } from "@/types/issue";
import { useInfiniteQuery } from "@tanstack/react-query";
import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { IssueCard } from "./IssueCard";

const IssueList: React.FC = () => {
  const getIssueQuery = useInfiniteQuery<Issue[]>({
    queryKey: ["issues"],
    queryFn: ({ pageParam = 1 }) => getIssue({ page: pageParam as number }),
    getNextPageParam: (lastPage, page) => {
      if (lastPage.length < 10) return undefined;
      return page.length + 1;
    },
  });

  if (getIssueQuery.isLoading) {
    return <>Loading...</>;
  }

  if (getIssueQuery.isError) {
    return <>Error occurred</>;
  }

  const issues = getIssueQuery.data.pages.flat();

  return (
    <div className="w-4/5 max-w-4xl px-12">
      <InfiniteScroll
        dataLength={issues.length}
        next={getIssueQuery.fetchNextPage}
        hasMore={getIssueQuery.hasNextPage ?? false}
        loader={<h4>Loading...</h4>}
        endMessage={
          <p className="text-center">
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <ul>
          {issues.map((issue) => {
            return <IssueCard issue={issue} key={issue.number} />;
          })}
        </ul>
      </InfiniteScroll>
    </div>
  );
};

export default IssueList;
