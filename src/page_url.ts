enum TimePeriod {
  day = 0,
  week = 1,
  month = 2,
  year = 3,
  all = 4,
}

enum Category {
  hot = 0,
  new = 1,
  top = 2,
}

export const getPageUrl = (
  subreddit: string,
  category: number,
  time?: number
) => {
  if (category === 2 && time !== undefined) {
    return `https://old.reddit.com/r/${subreddit}/top/?sort=top&t=${TimePeriod[time]}`;
  } else {
    return `https://old.reddit.com/r/${subreddit}/${Category[category]}`;
  }
};
