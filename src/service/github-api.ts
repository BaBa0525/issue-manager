import { type GithubApi } from "@/types/api";

export const githubApiFetcher = async ({ filter, accessToken }: GithubApi) => {
  const searchParam = new URLSearchParams({ filter });

  const response = await fetch(
    `https://api.github.com/issues?${searchParam.toString()}`,
    {
      headers: {
        accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const MockApiFetcher = async ({
  accessToken,
  pageNumber = 1,
}: GithubApi) => {
  const searchParam = new URLSearchParams({
    per_page: "10",
    page: pageNumber.toString(),
  });

  const response = await fetch(
    `https://api.github.com/repos/vercel/next.js/issues?${searchParam.toString()}`,
    {
      headers: {
        accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!response.ok) {
    throw Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};
