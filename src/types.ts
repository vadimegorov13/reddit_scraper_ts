/**
 * An entry with a rank, title, and URL
 * @property {number} rank - The rank of this entry
 * @property {string} title - The title of this entry
 * @property {string} url - The URL of this entry
 */
export type Entry = {
  rank: number;
  title: string;
  url: string;
};

/**
 * A post, which is an entry with additional properties
 * @property {string} content - The content of the post
 * @property {string} score - The score of the post
 * @property {number} comments - The number of comments on the post
 * @property {string} [postTime] - The time that the post was made
 * @property {string} [authorUrl] - The URL of the author of the post
 * @property {string} [authorName] - The name of the author of the post
 */
export type Post = Entry & {
  content: string;
  score: string;
  comments: number;
  postTime?: string;
  authorUrl?: string;
  authorName?: string;
};
