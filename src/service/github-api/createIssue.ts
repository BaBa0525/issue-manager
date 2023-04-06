import type { CreateIssue } from "@/types/api";
import type { RawIssue } from "@/types/issue";
import { getCustomLabel } from "@/utils/label";
import axios from "axios";
import { getSession } from "next-auth/react";
import { githubRepoApi } from "../base";

export const createIssue = async ({ title, body }: CreateIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const response = await githubRepoApi
    .post<RawIssue>(
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
  const customLabel = getCustomLabel(response.data.labels);

  return { newIssue: { ...response.data, customLabel } };
};
