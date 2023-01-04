import puppeteer from 'puppeteer';
import {Browser, Page, ElementHandle} from 'puppeteer';
import {Entry, Post} from './types';

/**
 * Object representing a scraper instance
 * @property {Browser} browser - The Puppeteer Browser object
 * @property {Page} page - The Puppeteer Page object
 */
const self = {
  browser: null as Browser | null, // The Browser object
  page: null as Page | null, // The Page object

  /**
   * Initializes the scraper by launching a Puppeteer browser and creating a new page
   * @param {string} page_url - The URL of the page to scrape
   * @returns {Promise} A promise that resolves when the browser and page have been created
   */
  init: async (page_url: string): Promise<any> => {
    // Launch the browser
    self.browser = await puppeteer.launch({
      headless: false,
    });
    // Create a new page
    self.page = await self.browser.newPage();

    // Go to the subreddit
    await self.page.goto(page_url, {waitUntil: 'networkidle0'});
  },

  /**
   * Quits the Puppeteer browser and closes the page
   * @returns {Promise} A promise that resolves when the browser and page have been closed
   */
  quit: async () => {
    // Close the page (if it exists)
    await self.page?.close();
  },

  /**
   * Scrapes a specified number of entries from the current subreddit page
   * @param {number} n - The number of entries to scrape
   * @returns {Promise<Entry[]>} A promise that resolves with an array of scraped entries
   */
  getEntries: async (n: number): Promise<Entry[]> => {
    let entries: Entry[] = [];

    // Get n elements
    for (let i = 0; i < n; i += 25) {
      // Get every entry from the page
      const elements: ElementHandle<HTMLDivElement>[] | undefined =
        await self.page?.$$('#siteTable > div[class*="self"]');

      if (!elements) break;

      for (const element of elements) {
        // Extract the rank of the entry
        const rank = await element.$eval('span[class="rank"]', node =>
          Number(node.innerText.trim())
        );

        // Extract the title of the entry
        const title = await element.$eval('p[class="title"]', node =>
          node.innerText.trim()
        );

        // Extract the URL of the entry
        const url = await element.$eval(
          'p[class="title"] > a[data-event-action="title"]',
          node => {
            return 'https://old.reddit.com/' + node.getAttribute('href');
          }
        );

        // Add the scraped entry to the array
        entries.push({
          url,
          rank,
          title,
        });
      }

      // Get the URL of the next page
      const nextPageUrl = await self.page?.$eval(
        '#siteTable > div[class="nav-buttons"] > span[class="nextprev"] > span[class="next-button"] > a',
        node => node.getAttribute('href')
      );

      // Navigate to the next page, if it exists
      if (nextPageUrl) {
        await self.page?.goto(nextPageUrl, {waitUntil: 'networkidle0'});
      } else {
        // If there is no next page, exit the loop
        break;
      }
    }
    return entries;
  },

  /**
   * Scrapes a specified number of posts from the current subreddit page
   * @param {number} n - The number of posts to scrape
   * @returns {Promise<Post[]>} A promise that resolves with an array of scraped posts
   */
  getPosts: async (n: number): Promise<Post[]> => {
    // Get the entries from the subreddit page
    const entries: Entry[] = await self.getEntries(n);
    // Array to hold the scraped posts
    const posts: Post[] = [];

    // If no entries were found, return an empty array
    if (!entries) return [];

    // Iterate over the entries
    for (const entrie of entries) {
      // If the page object is not available, return an empty array
      if (!self.page) return [];
      // Go to the entry's URL
      await self.page.goto(entrie.url, {waitUntil: 'networkidle0'});

      // Get the element containing the post's content
      const element = await self.page.$('div[class="expando"]');
      // If the element is not found, return an empty array
      if (!element) return [];
      // Get all the paragraphs within the element
      const paragraphs = await element.$$('p');
      // If no paragraphs were found, return an empty array
      if (!paragraphs) return [];
      // Extract the content of the paragraphs
      const paragraphsContent = await Promise.all(
        paragraphs.map(p => p.evaluate(node => node.innerText))
      );
      // Join the paragraphs' content into a single string
      const content = paragraphsContent.join(' ');

      // Extract the title of the post
      const title = await self.page.$eval(
        '#siteTable > div[id^="thing_"] > div[class="entry unvoted"] > div[class="top-matter"] > p[class="title"] > a[data-event-action="title"]',
        node => node.innerText
      );

      // Extract the score of the post
      const score = await self.page.$eval(
        '#siteTable > div[id^="thing_"] > div[class="midcol unvoted"] > div[class^="score"]',
        node => node.innerText.replace(/,/g, '')
      );

      // Extract the number of comments on the post
      const comments = await self.page.$eval(
        '#siteTable > div[id^="thing_"] > div[class="entry unvoted"] > ul[class="flat-list buttons"] > li[class="first"] > a[data-event-action="comments"]',
        node => Number(node.innerText.split(' ')[0].replace(/,/g, ''))
      );

      // Add the post entry to the array
      posts.push({
        rank: entrie.rank,
        url: entrie.url,
        title,
        content,
        score,
        comments,
      });
    }
    return posts;
  },
};

export default self;
