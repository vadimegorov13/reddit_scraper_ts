export type Entry = {
  rank: number;
  title: string;
  url: string;
};

export type Post = Entry & {
  content: string;
  score: string;
  comments: number;
  postTime?: string;
  authorUrl?: string;
  authorName?: string;
};
