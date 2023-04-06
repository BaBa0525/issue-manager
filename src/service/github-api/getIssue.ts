import { env } from "@/env.mjs";
import type { GetIssue } from "@/types/api";
import type { RawIssue } from "@/types/issue";
import { getCustomLabel } from "@/utils/label";
import { getSession } from "next-auth/react";
import { githubSearchApi } from "../base";

export const getIssue = async ({
  page = 1,
  query = "",
  order = "desc",
  customLabel: label = "all",
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
        customLabel: getCustomLabel(issue.labels),
      } as const)
  );
};
