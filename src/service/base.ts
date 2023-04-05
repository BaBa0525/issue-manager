import { env } from "@/env.mjs";
import axios from "axios";

export const githubApi = axios.create({
  baseURL: `https://api.github.com/repos/${env.NEXT_PUBLIC_REPO_OWNER}/${env.NEXT_PUBLIC_REPO_NAME}}`,
  headers: {
    accept: "application/vnd.github+json",
  },
});

export const githubSearchApi = axios.create({
  baseURL: "https://api.github.com/search",
  headers: {
    accept: "application/vnd.github+json",
  },
});
