import type { Label } from "@/types/issue";

export const getCustomLabel = (labels: Label[]) => {
  const openLabel = labels.filter((label) => label.name === "open");
  if (openLabel.length !== 0) return "open";

  const inProgressLabel = labels.filter(
    (label) => label.name === "in progress"
  );
  if (inProgressLabel.length !== 0) return "in progress";
  const doneLabel = labels.filter((label) => label.name === "done");
  if (doneLabel.length !== 0) return "done";
  return "open";
};
