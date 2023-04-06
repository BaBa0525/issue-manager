export type RawIssue = Omit<Issue, "customLabel">;

export type Issue = {
  id: string;
  number: string;
  title: string;
  body: string;
  customLabel: "open" | "in progress" | "done";
  labels: Label[];
};

export type Label = {
  name: string;
};
