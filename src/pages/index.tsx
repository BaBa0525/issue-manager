import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";

import { CreateIssueForm } from "@/components/CreateIssueForm";
import { IssueCard } from "@/components/IssueCard";
import { useLazy } from "@/hooks/useLazy";
import { Layout } from "@/layouts/Layout";
import { getIssue } from "@/service/github-api/getIssue";
import { type Issue } from "@/types/issue";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useState } from "react";
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

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<Filter>("all");

  const lazy = useLazy(500);
  const getIssueQuery = useInfiniteQuery({
    queryKey: ["issues", { query, order, filter }],
    queryFn: ({ pageParam = 1 }) =>
      getIssue({
        page: pageParam as number,
        query,
        order,
        filter,
      }),
    getNextPageParam: (lastPage, page) => {
      if (lastPage.length < 10) return undefined;
      return page.length + 1;
    },
    refetchOnMount: false,
    // keepPreviousData: true,
  });

  if (status === "loading") {
    return <p>Hang on there...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Layout>
          <div className="absolute top-1/2 translate-y-1/2">
            <button
              className="inline-block rounded-full bg-gray-200 px-6 py-3  text-2xl font-semibold text-gray-700"
              onClick={() => void signIn("github")}
            >
              Sign in with GitHub
            </button>
          </div>
        </Layout>
      </>
    );
  }

  if (!session) {
    return <>Fail to get session</>;
  }

  if (getIssueQuery.isError) {
    return <>Error occurred</>;
  }

  const issues = getIssueQuery.data?.pages.flat() ?? [];

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

        {getIssueQuery.isLoading ? (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
            <Loading />
          </div>
        ) : (
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
        )}
      </div>
    </Layout>
  );
};

export default Home;

const Loading: React.FC = () => {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="mr-2 h-16 w-16 animate-spin fill-navbar text-gray-200 dark:text-gray-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
