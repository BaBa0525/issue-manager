import type { DeleteIssue } from "@/types/api";
import type { RawIssue } from "@/types/issue";
import { getCustomLabel } from "@/utils/label";
import axios from "axios";
import { getSession } from "next-auth/react";
import { githubRepoApi } from "../base";

export const deleteIssue = async ({ issue_number }: DeleteIssue) => {
  const session = await getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const response = await githubRepoApi
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
      label: getCustomLabel(response.data.labels),
    },
  };
};
