export type RawIssue = {
  id: string;
  number: string;
  title: string;
  body: string;
  labels: Label[];
};

export type Issue = {
  id: string;
  number: string;
  title: string;
  body: string;
  label: "open" | "in progress" | "done";
};

export type Label = {
  name: string;
};
