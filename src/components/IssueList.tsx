import { deleteIssue, getIssue, updateIssue } from "@/service/github-api";
import { type Issue } from "@/types/issue";
import { Menu, Transition } from "@headlessui/react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import React from "react";
import { AiOutlineMore } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";
import ReactMarkdown from "react-markdown";

const IssueList: React.FC = () => {
  const getIssueQuery = useInfiniteQuery<Issue[]>({
    queryKey: ["issues"],
    queryFn: ({ pageParam = 1 }) => getIssue({ page: pageParam as number }),
    getNextPageParam: (lastPage, page) => {
      if (lastPage.length < 10) return undefined;
      return page.length + 1;
    },
  });

  const queryClient = useQueryClient();

  const updateIssueMutation = useMutation({
    mutationFn: updateIssue,
    onMutate: async (updatedIssue) => {
      await queryClient.cancelQueries(["issues"]);
      const previousIssues = queryClient.getQueryData<InfiniteData<Issue[]>>([
        "issues",
      ]);

      queryClient.setQueryData(["issues"], {
        ...previousIssues,
        pages: previousIssues?.pages?.map((page) => {
          return page.map((issue) => {
            if (issue.number === updatedIssue.issue_number) {
              return {
                ...issue,
                ...updatedIssue,
              };
            }
            return issue;
          });
        }),
      });

      return { previousIssues };
    },
    onError: (err, newIssue, context) => {
      queryClient.setQueryData(["issues"], context?.previousIssues ?? []);
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
            return (
              <li
                key={issue.id}
                className="relative my-4 rounded-md bg-white px-12 py-2"
              >
                <OptionDropdown />
                <h2 className="my-3 text-2xl font-bold">{issue.title}</h2>
                {issue.labels.map((label) => {
                  return (
                    <span
                      key={label.id}
                      className="mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                      {label.name}
                    </span>
                  );
                })}
                <button
                  className="border-2 border-black bg-gray-300"
                  onClick={() =>
                    void updateIssueMutation.mutateAsync({
                      issue_number: issue.number,
                      title: "updated title",
                      body: "updated body",
                    })
                  }
                >
                  update
                </button>
                <button
                  className="border-2 border-black bg-gray-300"
                  // eslint-disable-next-line @typescript-eslint/no-misused-promises
                  onClick={async () => {
                    await deleteIssue({ issue_number: issue.number });
                    void getIssueQuery.refetch();
                  }}
                >
                  delete
                </button>
                <ReactMarkdown className="prose lg:prose-lg">
                  {issue.body}
                </ReactMarkdown>
              </li>
            );
          })}
        </ul>
      </InfiniteScroll>
    </div>
  );
};

export default IssueList;

const OptionDropdown: React.FC = () => {
  return (
    <div className="absolute top-2 right-3 w-56 text-right">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button>
          <AiOutlineMore className="gray-400 top-2 right-2 m-3 h-6 w-6" />
        </Menu.Button>
        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            as="ul"
            className="absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div className="p-1">
              <Menu.Item as="li">
                <button className="w-full rounded-md py-2 px-4 text-left hover:bg-navbar hover:text-white">
                  Edit
                </button>
              </Menu.Item>
              <Menu.Item as="li">
                <button className="w-full rounded-md py-2 px-4 text-left hover:bg-navbar hover:text-white">
                  Delete
                </button>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
