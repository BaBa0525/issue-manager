import axios from "axios";

export const githubApi = axios.create({
  baseURL: "https://api.github.com/repos/BaBa0525/issue-manager",
  headers: {
    accept: "application/vnd.github+json",
  },
});
