import * as fs from 'fs';
import {getPageUrl} from './page_url';
import reddit from './reddit';

/**
 * Scrapes a subreddit and writes the results to a JSON file
 * @param {string} subreddit - The name of the subreddit to scrape
 * @returns {Promise} A promise that resolves when the scrape and write operations are complete
 */
const scrapeSubreddit = async (subreddit: string) => {
  console.log(`Starting scraping r/${subreddit}.`);

  // Get the URL of the subreddit page to scrape
  const page_url = getPageUrl(subreddit, 2, 4);

  // Initialize the scraper with the subreddit page URL
  await reddit.init(page_url);
  // Scrape the posts from the subreddit page
  const results = await reddit.getPosts(100);

  // Convert the results to a JSON string
  const json = JSON.stringify(results);
  // If there is data to write, write it to a JSON file
  if (json) {
    fs.writeFile(`data/${subreddit}.json`, json, 'utf8', err => {
      if (err) return console.log(err);
      console.log(`File "${subreddit}.json" written successfully\n`);
    });
  } else {
    console.log(`No data to write for r/${subreddit}`);
  }

  // Close the Puppeteer browser
  await reddit.quit();

  console.log(`Complete.`);
};

(async () => {
  // Array of subreddit names to scrape
  const subreddits: string[] = [
    'TrueOffMyChest',
    'AmItheAsshole',
    'offmychest',
    'confession',
  ];

  // Scrape each subreddit in the array
  for (const subreddit of subreddits) {
    await scrapeSubreddit(subreddit);
  }
})();
