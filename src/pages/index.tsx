import IssueList from "@/components/IssueList";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

import { Layout } from "@/layouts/Layout";
import { createIssue } from "@/service/github-api";
import { type Issue } from "@/types/issue";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(1000),
});

type CreateSchema = z.infer<typeof createSchema>;

const Home: NextPage = () => {
  const { data: session, status } = useSession();

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
      ]);

      return { previousIssues };
    },
    onError: (err, newIssue, context) => {
      queryClient.setQueryData(["issues"], context?.previousIssues ?? []);
      // TODO: Alert something
    },
    onSuccess: ({ newIssue }) => {
      const previousIssues = queryClient.getQueryData<InfiniteData<Issue[]>>([
        "issues",
      ]);

      queryClient.setQueryData(["issues"], {
        ...previousIssues,
        pages: previousIssues?.pages?.map((page, index) => {
          if (index !== 0) {
            return page;
          }
          return [newIssue, ...page];
        }) ?? [[newIssue]],
      });
    },
  });

  const createSubmitHandler = async (data: CreateSchema) => {
    await createIssueMutation.mutateAsync(data);
    reset();
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

  const userName = session.user.login;
  const userPicture = session.user.image;

  return (
    <Layout>
      <form
        className="gap-4"
        onSubmit={(e) => void handleSubmit(createSubmitHandler)(e)}
      >
        <fieldset>
          <label htmlFor="title" className="block">
            Title
          </label>
          <input {...register("title")} className="rounded-lg border" />
          {errors.title && <p>{errors.title.message}</p>}
        </fieldset>
        <fieldset>
          <label htmlFor="body" className="block">
            Body
          </label>
          <textarea
            {...register("body")}
            className="resize-none rounded-lg border"
          />
          {errors.body && <p>{errors.body.message}</p>}
        </fieldset>
        <button>Create Issue</button>
      </form>
      <p>Signed in as {userName}</p>
      <Image src={userPicture || ""} alt="you" width={50} height={50} />
      <div>
        <button onClick={() => void signOut()}>Sign out</button>
      </div>
      <IssueList />
    </Layout>
  );
};

export default Home;
