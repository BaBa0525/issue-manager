import { useUpdateIssue } from "@/hooks/useUpdateIssue";
import { useIssueContext } from "@/pages";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Loading } from "../Loading";

type EditIssueCardProps = {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

const editSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  body: z
    .string()
    .min(30, "Body must contain at least 30 characters")
    .max(1000),
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
      label: issue.customLabel,
    },
    resolver: zodResolver(editSchema),
  });

  const editSubmit = handleSubmit(async (data) => {
    await updateIssueMutation
      .mutateAsync({
        update: {
          title: data.title,
          body: data.body,
          customLabel: data.label,
        },
        oldIssue: issue,
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
      <div>
        <form
          className="flex flex-col gap-3"
          style={{ opacity: updateIssueMutation.isLoading ? 0.3 : 1 }}
        >
          <fieldset disabled={updateIssueMutation.isLoading}>
            <input
              {...register("title")}
              className="mt-3 w-full rounded-md bg-slate-100 px-2 text-2xl font-bold"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </fieldset>
          <fieldset disabled={updateIssueMutation.isLoading}>
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
          <fieldset disabled={updateIssueMutation.isLoading}>
            <textarea
              {...register("body")}
              className="prose h-40 w-full resize-none rounded-md bg-slate-100 px-2 lg:prose-lg"
            />
            {errors.body && (
              <p role="alert" className="text-red-500">
                {errors.body.message}
              </p>
            )}
          </fieldset>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              disabled={updateIssueMutation.isLoading}
              className="rounded-md bg-gray-200 px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={(e) => void editSubmit(e)}
              disabled={updateIssueMutation.isLoading}
              className="rounded-md bg-button-create px-2 py-1 text-white"
            >
              Update
            </button>
          </div>
        </form>
        {updateIssueMutation.isLoading && <Loading />}
      </div>
    </>
  );
};
