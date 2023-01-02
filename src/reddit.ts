import puppeteer from 'puppeteer';
import {Browser, Page, ElementHandle} from 'puppeteer';
import {Entry, Post} from './types';

const self = {
  browser: null as Browser | null, // Update the type of the browser property
  page: null as Page | null,

  init: async (page_url: string) => {
    self.browser = await puppeteer.launch({
      headless: false,
    });
    self.page = await self.browser.newPage();

    // Go to the subreddit
    await self.page.goto(page_url, {waitUntil: 'networkidle0'});
  },

  getEntries: async (n: number) => {
    let entries: Entry[] = [];

    // Get n elements
    for (let i = 0; i < n; i += 25) {
      // Get every entry from the page
      const elements: ElementHandle<HTMLDivElement>[] | undefined =
        await self.page?.$$('#siteTable > div[class*="self"]');

      if (!elements) break;

      for (const element of elements) {
        const rank = await element.$eval('span[class="rank"]', node =>
          Number(node.innerText.trim())
        );

        const title = await element.$eval('p[class="title"]', node =>
          node.innerText.trim()
        );

        const url = await element.$eval(
          'p[class="title"] > a[data-event-action="title"]',
          node => {
            return 'https://old.reddit.com/' + node.getAttribute('href');
          }
        );

        entries.push({
          url,
          rank,
          title,
        });
      }

      const nextPageUrl = await self.page?.$eval(
        '#siteTable > div[class="nav-buttons"] > span[class="nextprev"] > span[class="next-button"] > a',
        node => node.getAttribute('href')
      );

      // Navigate to the next page, if it exists
      console.log('nextPageUrl', nextPageUrl);
      if (nextPageUrl) {
        await self.page?.goto(nextPageUrl, {waitUntil: 'networkidle0'});
      } else {
        break;
      }
    }
    return entries;
  },

  getPosts: async (n: number) => {
    const entries: Entry[] = await self.getEntries(n);
    const posts: Post[] = [];

    if (!entries) return;

    for (const entrie of entries) {
      if (!self.page) return;
      await self.page.goto(entrie.url, {waitUntil: 'networkidle0'});

      const element = await self.page.$('div[class="expando"]');
      if (!element) return;
      const paragraphs = await element.$$('p');
      if (!paragraphs) return;
      const paragraphsContent = await Promise.all(
        paragraphs.map(p => p.evaluate(node => node.innerText))
      );
      const content = paragraphsContent.join(' ');

      const title = await self.page.$eval(
        '#siteTable > div[id^="thing_"] > div[class="entry unvoted"] > div[class="top-matter"] > p[class="title"] > a[data-event-action="title"]',
        node => node.innerText
      );

      const score = await self.page.$eval(
        '#siteTable > div[id^="thing_"] > div[class="midcol unvoted"] > div[class^="score"]',
        node => node.innerText.replace(/,/g, '')
      );

      const comments = await self.page.$eval(
        '#siteTable > div[id^="thing_"] > div[class="entry unvoted"] > ul[class="flat-list buttons"] > li[class="first"] > a[data-event-action="comments"]',
        node => Number(node.innerText.split(' ')[0].replace(/,/g, ''))
      );

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

// const score = await element.$eval('div[class="score likes"]', node => {
//   return node.textContent ? node.textContent.trim() : null;
// });
// const comments = await element.$eval('a[data-event-action="comments"]', node =>
//   node.innerText.trim()
// );
// const postTime = await element.$eval('p[class="tagline "] > time', node =>
//   node.getAttribute('title')
// );
// const authorUrl = await element.$eval(
//   'p[class="tagline "] > a[class*="author"]',
//   node => node.getAttribute('href')
// );
// const authorName = await element.$eval(
//   'p[class="tagline "] > a[class*="author"]',
//   node => node.innerText.trim()
// );
