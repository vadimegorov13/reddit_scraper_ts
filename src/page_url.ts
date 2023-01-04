/**
 * Enum representing possible time periods for the "top" category
 * @readonly
 * @enum {number}
 */
enum TimePeriod {
  day = 0,
  week = 1,
  month = 2,
  year = 3,
  all = 4,
}

/**
 * Enum representing possible categories
 * @readonly
 * @enum {number}
 */
enum Category {
  hot = 0,
  new = 1,
  top = 2,
}

/**
 * Returns the URL of a page on old.reddit.com for a given subreddit and category
 * @param {string} subreddit - The subreddit to get the page for
 * @param {number} category - The category to get the page for. Should be one of the values of the `Category` enum.
 * @param {number} [time] - The time period to use for the "top" category. Should be one of the values of the `TimePeriod` enum.
 * @returns {string} The URL of the page
 */
export const getPageUrl = (
  subreddit: string,
  category: number,
  time?: number
): string => {
  // If the category is "top" and a time period is specified, use the "top" endpoint with the specified time period
  if (category === 2 && time !== undefined) {
    return `https://old.reddit.com/r/${subreddit}/top/?sort=top&t=${TimePeriod[time]}`;
  } else {
    // Otherwise, use the endpoint for the specified category
    return `https://old.reddit.com/r/${subreddit}/${Category[category]}`;
  }
};
