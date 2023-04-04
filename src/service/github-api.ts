import { type CreateIssue, type GetIssue } from "@/types/api";
import { type Issue } from "@/types/issue";
import { getSession } from "next-auth/react";
import { githubApi } from "./base";

export const createIssue = async ({ title, body }: CreateIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const response = await githubApi.post(
    "/issues",
    { title, body },
    { headers: { Authorization: `Bearer ${session.accessToken}` } }
  );

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);
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
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }
  );

  if (!response.data) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  console.log(response.data);

  return response.data;
};
