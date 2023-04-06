import { signIn, useSession } from "next-auth/react";

import { useCreateIssue } from "@/hooks/useCreateIssue";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Loading } from "./Loading";

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

  const createIssueMutation = useCreateIssue();

  const createSubmitHandler = async (data: CreateSchema) => {
    setFilter("all");
    setOrder("desc");
    await createIssueMutation.mutateAsync(data).catch((err) => {
      if (err instanceof Error) return toast.error(err.message);
      toast.error("Something went wrong");
    });
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
    <div className="relative">
      <form
        className="w-full space-y-4 px-12"
        onSubmit={(e) => void handleSubmit(createSubmitHandler)(e)}
        style={{ opacity: createIssueMutation.isLoading ? 0.3 : 1 }}
      >
        <fieldset>
          <label htmlFor="title" className="block text-2xl font-semibold">
            Title
          </label>
          <input
            {...register("title")}
            className="w-full rounded-md border px-2"
            disabled={createIssueMutation.isLoading}
          />
          {errors.title && (
            <p className="text-red-500">{errors.title.message}</p>
          )}
        </fieldset>
        <fieldset>
          <label htmlFor="body" className="block text-2xl font-semibold">
            Body
          </label>
          <textarea
            {...register("body")}
            className="h-40 w-full resize-none rounded-md border px-2"
            disabled={createIssueMutation.isLoading}
          />
          {errors.body && <p className="text-red-500">{errors.body.message}</p>}
        </fieldset>
        <div className="flex gap-2">
          <button
            className="rounded-md bg-gray-200 px-2 py-1"
            onClick={() => setIsEditing(false)}
            disabled={createIssueMutation.isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-button-create px-2 py-1 text-white"
            disabled={createIssueMutation.isLoading}
          >
            Create Issue
          </button>
        </div>
      </form>
      {createIssueMutation.isLoading && <Loading />}
    </div>
  ) : (
    <button
      className="rounded-full bg-button-create px-4 py-1 text-white"
      onClick={() => setIsEditing(true)}
    >
      New Issue
    </button>
  );
};
