import { getIssue } from "@/service/github-api";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { IssueCard } from "./IssueCard";

const useLazy = (delayInMs: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();

  return (callback: () => void) => {
    if (timeoutRef.current != undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    timeoutRef.current = setTimeout(() => {
      callback();
      timeoutRef.current == undefined;
    }, delayInMs);
  };
};

const filters = ["all", "open", "in progress", "done"] as const;
type Filter = (typeof filters)[number];

const IssueList: React.FC = () => {
  const [query, setQuery] = useState("");
  const lazy = useLazy(500);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Filter>("all");
  const getIssueQuery = useInfiniteQuery({
    queryKey: ["issues", query, order],
    queryFn: ({ pageParam = 1 }) =>
      getIssue({
        page: pageParam as number,
        query,
        order,
      }),
    getNextPageParam: (lastPage, page) => {
      if (lastPage.length < 10) return undefined;
      return page.length + 1;
    },
    refetchOnMount: false,
    keepPreviousData: true,
  });

  if (getIssueQuery.isLoading) {
    return <>Loading...</>;
  }

  if (getIssueQuery.isError) {
    return <>Error occurred</>;
  }

  console.log(filter);

  const issues = (() => {
    if (filter === "all") return getIssueQuery.data.pages.flat();
    return getIssueQuery.data.pages.flat().filter((issue) => {
      return issue.label === filter;
    });
  })();

  return (
    <div className="w-4/5 max-w-4xl px-12">
      <input
        onChange={(e) => lazy(() => setQuery(e.target.value))}
        className="w-full border px-2 py-1"
      />
      <select onChange={(e) => setFilter(e.target.value as Filter)}>
        {filters.map((filter) => {
          return (
            <option value={filter} key={filter}>
              {filter}
            </option>
          );
        })}
      </select>
      <button
        onClick={() => {
          setOrder((prev) => {
            if (prev === "asc") return "desc";
            return "asc";
          });
        }}
      >
        Order
      </button>

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
