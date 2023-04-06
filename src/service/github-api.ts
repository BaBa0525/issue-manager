import { env } from "@/env.mjs";
import {
  type CreateIssue,
  type DeleteIssue,
  type GetIssue,
  type UpdateIssue,
} from "@/types/api";
import { type Issue, type Label, type RawIssue } from "@/types/issue";
import axios from "axios";
import { getSession } from "next-auth/react";
import { githubApi, githubSearchApi } from "./base";

// TODO: ...
const getLabel = (labels: Label[]) => {
  const openLabel = labels.filter((label) => label.name === "open");
  if (openLabel.length !== 0) return "open";
  const inProgressLabel = labels.filter(
    (label) => label.name === "in progress"
  );
  if (inProgressLabel.length !== 0) return "in progress";
  const doneLabel = labels.filter((label) => label.name === "done");
  if (doneLabel.length !== 0) return "done";
  return "open";
};

export const createIssue = async ({ title, body }: CreateIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const response = await githubApi
    .post<Issue>(
      "/issues",
      { title, body, labels: ["open"] },
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("You don't have permission to create issue.");
        }
        throw new Error(
          `API error: ${error.response?.status || ""} ${
            error.response?.statusText || ""
          } `
        );
      }
      throw new Error("Something went wrong.");
    });

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return { newIssue: response.data };
};

export const getIssue = async ({
  page = 1,
  query = "",
  order = "desc",
  label = "all",
}: GetIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const q = [
    `repo:${env.NEXT_PUBLIC_REPO_OWNER}/${env.NEXT_PUBLIC_REPO_NAME}`,
    label === "all" ? "" : `label:"${label}"`,
    "state:open",
    query,
  ]
    .filter(Boolean)
    .join(" ");

  const searchParam = new URLSearchParams({
    q,
    per_page: "10",
    page: page.toString(),
    order,
    sort: "created",
  });

  const response = await githubSearchApi.get<{ items: RawIssue[] }>(
    `/issues?${searchParam.toString()}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return response.data.items.map(
    (issue) =>
      ({
        ...issue,
        label: getLabel(issue.labels),
      } as const)
  );
};

export const updateIssue = async ({
  issue_number,
  title,
  body,
  label,
}: UpdateIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const response = await githubApi
    .patch<RawIssue>(
      `/issues/${issue_number}`,
      { body, title, labels: [label] },
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("You don't have permission to update this issue.");
        }
        throw new Error(
          `API error: ${error.response?.status || ""} ${
            error.response?.statusText || ""
          } `
        );
      }
      throw new Error("Something went wrong.");
    });

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return {
    updatedIssue: {
      ...response.data,
      label: getLabel(response.data.labels),
    } as const,
  };
};

export const deleteIssue = async ({ issue_number }: DeleteIssue) => {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await githubApi
    .patch<RawIssue>(
      `/issues/${issue_number}`,
      { state: "closed" },
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )
    .catch((error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error("You don't have permission to delete this issue.");
        }
        throw new Error(
          `API error: ${error.response?.status || ""} ${
            error.response?.statusText || ""
          } `
        );
      }
      throw new Error("Something went wrong.");
    });

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return {
    deletedIssue: {
      ...response.data,
      label: getLabel(response.data.labels),
    },
  };
};
