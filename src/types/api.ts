export type GithubApi = {
  filter: "all";
  accessToken: string;
  pageNumber: number;
};

export type GetIssue = {
  page: number;
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

export type MockApi = {
  filter: "all";
};
