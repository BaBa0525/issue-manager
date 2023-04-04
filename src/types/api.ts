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

export type MockApi = {
  filter: "all";
};
