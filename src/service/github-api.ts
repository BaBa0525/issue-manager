import {
  DeleteIssue,
  UpdateIssue,
  type CreateIssue,
  type GetIssue,
} from "@/types/api";
import { type Issue } from "@/types/issue";
import { getSession } from "next-auth/react";
import { githubApi } from "./base";

export const createIssue = async ({ title, body }: CreateIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const response = await githubApi.post<Issue>(
    "/issues",
    { title, body, labels: ["open"] },
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return { newIssue: response.data };
};

export const getIssue = async ({ page = 1 }: GetIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const searchParam = new URLSearchParams({
    per_page: "10",
    page: page.toString(),
  });

  const response = await githubApi.get<Issue[]>(
    `/issues?${searchParam.toString()}`,
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return response.data;
};

export const updateIssue = async ({
  issue_number,
  title,
  body,
}: UpdateIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const response = await githubApi.patch<Issue[]>(
    `/issues/${issue_number}`,
    { body, title },
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return response.data;
};

export const deleteIssue = async ({ issue_number }: DeleteIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const response = await githubApi.patch<Issue[]>(
    `/issues/${issue_number}`,
    { state: "closed" },
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return response.data;
};
