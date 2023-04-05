import { signIn, useSession } from "next-auth/react";

import { createIssue } from "@/service/github-api";
import { type Issue } from "@/types/issue";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  body: z
    .string()
    .min(30, "Body must contain at least 30 characters")
    .max(1000),
});

type CreateSchema = z.infer<typeof createSchema>;

type CreateIssueFormProps = {
  setFilter: React.Dispatch<
    React.SetStateAction<"all" | "open" | "in progress" | "done">
  >;
  setOrder: React.Dispatch<React.SetStateAction<"desc" | "asc">>;
};

export const CreateIssueForm: React.FC<CreateIssueFormProps> = ({
  setFilter,
  setOrder,
}) => {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateSchema>({
    resolver: zodResolver(createSchema),
  });

  const queryClient = useQueryClient();

  const createIssueMutation = useMutation({
    mutationFn: createIssue,
    onMutate: async () => {
      await queryClient.cancelQueries(["issues"]);
      const previousIssues = queryClient.getQueryData<InfiniteData<Issue[]>>([
        "issues",
        "",
        "desc",
        "all",
      ]);

      return { previousIssues };
    },
    onError: (err, newIssue, context) => {
      queryClient.setQueryData(
        ["issues", "", "desc", "all"],
        context?.previousIssues ?? []
      );
      // TODO: Alert something
    },
    onSuccess: ({ newIssue }) => {
      const previousIssues = queryClient.getQueryData<InfiniteData<Issue[]>>([
        "issues",
        "",
        "desc",
        "all",
      ]);

      console.log(newIssue);

      queryClient.setQueryData(["issues", "", "desc", "all"], {
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

  const createSubmitHandler = async (data: CreateSchema) => {
    setFilter("all");
    setOrder("desc");
    await createIssueMutation.mutateAsync(data);
    reset();
    setIsEditing(false);
  };

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

  return isEditing ? (
    <form
      className="w-full space-y-4 px-12"
      onSubmit={(e) => void handleSubmit(createSubmitHandler)(e)}
    >
      <fieldset>
        <label htmlFor="title" className="block text-2xl font-semibold">
          Title
        </label>
        <input
          {...register("title")}
          className="w-full rounded-md border  px-2"
        />
        {errors.title && <p>{errors.title.message}</p>}
      </fieldset>
      <fieldset>
        <label htmlFor="body" className="block text-2xl font-semibold">
          Body
        </label>
        <textarea
          {...register("body")}
          className="h-40 w-full resize-none rounded-md border px-2"
        />
        {errors.body && <p>{errors.body.message}</p>}
      </fieldset>
      <div className="flex gap-2">
        <button
          className="rounded-md bg-gray-200 px-2 py-1"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-button-create px-2 py-1 text-white"
        >
          Create Issue
        </button>
      </div>
    </form>
  ) : (
    <button
      className="rounded-full bg-button-create px-4 py-1 text-white"
      onClick={() => setIsEditing(true)}
    >
      New Issue
    </button>
  );
};
