export type KV = {
  key: string;
  value: string;
};

export type FormData = {
  files?: FileList;
  kvPairs?: KV[];
  text?: string;
};
