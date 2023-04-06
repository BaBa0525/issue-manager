import type { UpdateIssue } from "@/types/api";
import type { RawIssue } from "@/types/issue";
import { getCustomLabel } from "@/utils/label";
import axios from "axios";
import { getSession } from "next-auth/react";
import { githubRepoApi } from "../base";

export const updateIssue = async ({
  update: { title, body, customLabel },
  oldIssue: { number, labels },
}: UpdateIssue) => {
  const session = await getSession();
  if (!session) {
    throw Error("Not authenticated");
  }

  const allCustomLabel = ["open", "in progress", "done"];
  const updateLabels = [
    customLabel,
    ...labels
      .filter((label) => !allCustomLabel.includes(label.name))
      .map((label) => label.name),
  ];

  console.log(updateLabels);

  const response = await githubRepoApi
    .patch<RawIssue>(
      `/issues/${number}`,
      { body, title, labels: updateLabels },
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
      label: getCustomLabel(response.data.labels),
    } as const,
  };
};
