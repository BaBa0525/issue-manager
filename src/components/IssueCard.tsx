import { deleteIssue, updateIssue } from "@/service/github-api";
import { type Issue } from "@/types/issue";
import { Menu, Transition } from "@headlessui/react";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineMore } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import { z } from "zod";

type IssueCardProps = {
  issue: Issue;
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <li key={issue.id} className="relative my-4 rounded-md bg-white px-12 py-2">
      {isEditing ? (
        <EditCard issue={issue} setIsEditing={setIsEditing} />
      ) : (
        <>
          <OptionDropdown issue={issue} setIsEditing={setIsEditing} />
          <div className="flex flex-col gap-3">
            <h2 className="mt-3 text-2xl font-bold">{issue.title}</h2>
            <div>
              <span className="mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
                {issue.label}
              </span>
            </div>

            <ReactMarkdown className="whitespace- prose break-words lg:prose-lg">
              {issue.body}
            </ReactMarkdown>
          </div>
        </>
      )}
    </li>
  );
};

type EditIssueCardProps = {
  issue: Issue;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const editSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
  label: z.enum(["open", "in progress", "done"]),
});

type EditSchema = z.infer<typeof editSchema>;

const EditCard: React.FC<EditIssueCardProps> = ({ issue, setIsEditing }) => {
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
      setIsEditing(false);
    },

    onSuccess: async ({ updatedIssue }) => {
      await queryClient.invalidateQueries(["issues"]);

      await queryClient.cancelQueries(["issues"]);
      const previousIssues = queryClient.getQueryData<InfiniteData<Issue[]>>([
        "issues",
      ]);

      queryClient.setQueryData(["issues"], {
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
      setIsEditing(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditSchema>({
    defaultValues: {
      title: issue.title,
      body: issue.body,
      label: issue.label,
    },
  });

  const editSubmit = handleSubmit(async (data) => {
    await updateIssueMutation.mutateAsync({
      issue_number: issue.number,
      title: data.title,
      body: data.body,
      label: data.label,
    });
  });

  const allLabels = ["open", "in progress", "done"] as const;

  return (
    <>
      <form className="flex flex-col gap-3">
        <fieldset
          disabled={updateIssueMutation.isLoading}
          className="disabled:opacity-30"
        >
          <input
            {...register("title")}
            className="mt-3 w-full rounded-md bg-slate-100 px-2 text-2xl font-bold"
          />
          {errors.title && <p>{errors.title.message}</p>}
        </fieldset>
        <fieldset
          disabled={updateIssueMutation.isLoading}
          className="disabled:opacity-30"
        >
          <select {...register("label")}>
            {allLabels.map((label) => (
              <option
                key={label}
                className="mr-2 inline-block rounded-full bg-violet-400 px-3 py-1 text-sm font-semibold text-white"
                value={label}
              >
                {label}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset
          disabled={updateIssueMutation.isLoading}
          className="disabled:opacity-30"
        >
          <textarea
            {...register("body")}
            className="prose h-40 w-full resize-none rounded-md bg-slate-100 px-2 lg:prose-lg"
          />
          {errors.body && <p>{errors.body.message}</p>}
        </fieldset>
        <div className="flex gap-4">
          <button
            onClick={() => setIsEditing(false)}
            disabled={updateIssueMutation.isLoading}
            className="disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={(e) => void editSubmit(e)}
            disabled={updateIssueMutation.isLoading}
            className="disabled:opacity-30"
          >
            Update
          </button>
        </div>
      </form>
    </>
  );
};

type OptionDropdownProps = {
  issue: Issue;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const OptionDropdown: React.FC<OptionDropdownProps> = ({
  issue,
  setIsEditing,
}) => {
  const queryClient = useQueryClient();
  const deleteIssueMutation = useMutation({
    mutationFn: deleteIssue,
    onError: (err, deletedIssue, context) => {
      // TODO: handle error
    },
    onSuccess({ deletedIssue }) {
      const previousIssues = queryClient.getQueryData<InfiniteData<Issue[]>>([
        "issues",
      ]);

      queryClient.setQueryData(["issues"], {
        ...previousIssues,
        pages: previousIssues?.pages?.map((page) => {
          return page.filter((issue) => issue.number !== deletedIssue.number);
        }),
      });
    },
  });

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
                <button
                  className="w-full rounded-md py-2 px-4 text-left hover:bg-navbar hover:text-white"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              </Menu.Item>
              <Menu.Item as="li">
                <button
                  className="w-full rounded-md py-2 px-4 text-left hover:bg-navbar hover:text-white"
                  onClick={() =>
                    void deleteIssueMutation.mutateAsync({
                      issue_number: issue.number,
                    })
                  }
                >
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
