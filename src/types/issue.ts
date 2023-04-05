export type Issue = {
  id: string;
  number: string;
  title: string;
  body: string;
  labels: Label[];
};

export type Label = {
  id: string;
  name: string;
};
