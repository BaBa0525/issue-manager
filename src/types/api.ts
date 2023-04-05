export type GetIssue = {
  page: number;
  query?: string;
  order?: "asc" | "desc";
  label?: "open" | "in progress" | "done" | "all";
};

export type CreateIssue = {
  title: string;
  body: string;
};

export type UpdateIssue = {
  issue_number: string;
  title: string;
  body: string;
  label: "open" | "in progress" | "done";
};

export type DeleteIssue = {
  issue_number: string;
};
