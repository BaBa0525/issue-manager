import { useUpdateIssue } from "@/hooks/useUpdateIssue";
import { useIssueContext } from "@/pages";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

type EditIssueCardProps = {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const editSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
  label: z.enum(["open", "in progress", "done"]),
});

type EditSchema = z.infer<typeof editSchema>;

export const EditCard: React.FC<EditIssueCardProps> = ({ setIsEditing }) => {
  const { issue, ...queryKey } = useIssueContext();
  const updateIssueMutation = useUpdateIssue(queryKey);

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
    await updateIssueMutation
      .mutateAsync({
        issue_number: issue.number,
        title: data.title,
        body: data.body,
        label: data.label,
      })
      .catch((err) => {
        if (err instanceof Error) return toast.error(err.message);
        toast.error("Something went wrong");
      });
    setIsEditing(false);
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
