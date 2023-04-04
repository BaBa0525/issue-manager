import { getIssue } from "@/service/github-api";
import { type Issue } from "@/types/issue";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ReactMarkdown from "react-markdown";

const IssueList: React.FC = () => {
  const [expandedIssue, setExpandedIssue] = useState("");

  const issuesRes = useInfiniteQuery<Issue[]>({
    queryKey: [],
    queryFn: ({ pageParam = 1 }) => getIssue({ page: pageParam as number }),
    getNextPageParam: (lastPage, page) => {
      if (lastPage.length < 10) return undefined;
      return page.length + 1;
    },
  });

  if (issuesRes.isLoading) {
    return <>Loading...</>;
  }

  if (issuesRes.isError) {
    return <>Error occurred</>;
  }

  const issues = issuesRes.data.pages.flat();

  const clickHandler = (id: string) => {
    if (id === expandedIssue) {
      setExpandedIssue("");
      return;
    }
    setExpandedIssue(id);
  };

  return (
    <InfiniteScroll
      dataLength={issues.length}
      next={issuesRes.fetchNextPage}
      hasMore={issuesRes.hasNextPage ?? false}
      loader={<h4>Loading...</h4>}
      endMessage={
        <p className="text-center">
          <b>Yay! You have seen it all</b>
        </p>
      }
    >
      <ul>
        {issues.map((issue) => {
          return (
            <li key={issue.id} className="border">
              <h2 className="m-3 text-2xl font-bold">Title: {issue.title}</h2>
              <button
                className="border-2 border-black bg-gray-300"
                onClick={() => clickHandler(issue.id)}
              >
                Open
              </button>
              {issue.id === expandedIssue && (
                <ReactMarkdown className="prose lg:prose-lg">
                  {issue.body}
                </ReactMarkdown>
              )}
            </li>
          );
        })}
      </ul>
    </InfiniteScroll>
  );
};

export default IssueList;
