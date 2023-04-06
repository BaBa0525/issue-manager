import type { Issue } from "./issue";

export type GetIssue = {
  page: number;
  query?: string;
  order?: "asc" | "desc";
  customLabel?: "open" | "in progress" | "done" | "all";
};

export type CreateIssue = {
  title: string;
  body: string;
};

export type UpdateIssue = {
  update: {
    title: string;
    body: string;
    customLabel: "open" | "in progress" | "done";
  };
  oldIssue: Issue;
};

export type DeleteIssue = {
  issue_number: string;
};
