import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";

import { CreateIssueForm } from "@/components/CreateIssueForm";
import { IssueCard } from "@/components/IssueCard";
import { useLazy } from "@/hooks/useLazy";
import { Layout } from "@/layouts/Layout";
import { getIssue } from "@/service/github-api";
import { type Issue } from "@/types/issue";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";

type IssueContextValue = {
  issue: Issue;
  filter: Filter;
  query: string;
  order: "asc" | "desc";
};
const IssueContext = createContext<IssueContextValue | null>(null);
export const useIssueContext = () => {
  const issue = useContext(IssueContext);
  if (!issue) {
    throw new Error("Issue context not found");
  }
  return issue;
};

const filters = ["all", "open", "in progress", "done"] as const;
type Filter = (typeof filters)[number];

const labelFilter = (filter: Filter, issues: Issue[]) => {
  if (filter === "all") return issues;
  return issues.filter((issue) => {
    return issue.label === filter;
  });
};

const Home: NextPage = () => {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const lazy = useLazy(500);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Filter>("all");
  const getIssueQuery = useInfiniteQuery({
    queryKey: ["issues", { query, order, filter }],
    queryFn: ({ pageParam = 1 }) =>
      getIssue({
        page: pageParam as number,
        query,
        order,
        label: filter,
      }),
    getNextPageParam: (lastPage, page) => {
      if (lastPage.length < 10) return undefined;
      return page.length + 1;
    },
    refetchOnMount: false,
    keepPreviousData: true,
  });

  if (status === "loading") {
    return <p>Hang on there...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <p>Not signed in.</p>
        <button onClick={() => void signIn("github")}>Sign in</button>
      </>
    );
  }

  if (!session) {
    return <>Fail to get session</>;
  }

  if (getIssueQuery.isLoading) {
    return <>Loading...</>;
  }

  if (getIssueQuery.isError) {
    return <>Error occurred</>;
  }

  const issues = labelFilter(filter, getIssueQuery.data.pages.flat());

  return (
    <Layout>
      <div className="mt-16 w-4/5 max-w-4xl px-12">
        <div className="flex h-12 flex-auto items-center gap-4 rounded-full bg-gray-200/90 px-4">
          <AiOutlineSearch className="h-full" />
          <input
            onChange={(e) => lazy(() => setQuery(e.target.value))}
            className="h-full flex-auto bg-transparent outline-none"
          />
        </div>
        <div className="my-2 flex w-full justify-between">
          <div>
            <h3>Label filter</h3>
            <select
              onChange={(e) => setFilter(e.target.value as Filter)}
              value={filter}
            >
              {filters.map((filter) => {
                return (
                  <option value={filter} key={filter}>
                    {filter}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <button
              className="rounded-full bg-black px-4 py-1 text-white"
              onClick={() => {
                setOrder((prev) => {
                  if (prev === "asc") return "desc";
                  return "asc";
                });
              }}
            >
              {`time ${order}ending`}
            </button>
          </div>
        </div>
        <CreateIssueForm setFilter={setFilter} setOrder={setOrder} />

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
            {issues.map((issue) => (
              <IssueContext.Provider
                key={issue.number}
                value={{ issue, filter, query, order }}
              >
                <IssueCard />
              </IssueContext.Provider>
            ))}
          </ul>
        </InfiniteScroll>
      </div>
    </Layout>
  );
};

export default Home;
