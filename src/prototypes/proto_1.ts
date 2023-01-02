import puppeteer from 'puppeteer';
import {getPageUrl} from '../page_url';

// Define a function to get the top posts from a subreddit
const getTopPosts = async (subreddit: string, c: number, t?: number) => {
  // Launch a headless Chrome browser
  const browser = await puppeteer.launch();

  // Create a new page
  const page = await browser.newPage();

  const url = getPageUrl(subreddit, c, t);
  console.log(url);

  // Navigate to the subreddit page
  await page.goto(url);

  // Wait for the page to load
  await page.waitForSelector('.rpBJOHq2PR60pnwJlUyP0');

  // Extract the top posts from the page
  let topPosts = await page.evaluate(() => {
    // Get the list of top post elements
    const postElements = Array.from(
      document.querySelectorAll('.rpBJOHq2PR60pnwJlUyP0')
    );

    // Extract the data from the post elements
    return postElements.map(postElement => {
      const titleElement = postElement.querySelector('._eYtD2XCVieq6emjKBH3m');
      const upvotesElement = postElement.querySelector(
        '._1rZYMD_4xY3gRcSS3p8ODO'
      );
      const commentsElement = postElement.querySelector(
        '.FHCV02u6Cp2zYL0fhQPsO'
      );

      return {
        title: titleElement ? titleElement.textContent : '',
        upvotes: upvotesElement ? upvotesElement.textContent : '',
        comments: commentsElement ? commentsElement.textContent : '',
      };
    });
  });

  // Scroll down to load more posts
  while (true) {
    console.log('Check if load more');
    // Check if the "Load More" button is visible
    const loadMoreButton = await page.$('.s1okktje-0.bYYBKs');
    if (loadMoreButton) {
      // Click the "Load More" button
      await loadMoreButton.click();

      // Wait for the new posts to load
      await page.waitForSelector('.rpBJOHq2PR60pnwJlUyP0');

      // Extract the additional top posts from the page
      const additionalPosts = await page.evaluate(() => {
        // Get the list of top post elements
        const postElements = Array.from(
          document.querySelectorAll('.rpBJOHq2PR60pnwJlUyP0')
        );

        // Extract the data from the post elements
        return postElements.map(postElement => {
          const titleElement = postElement.querySelector(
            '._eYtD2XCVieq6emjKBH3m'
          );
          const upvotesElement = postElement.querySelector(
            '._1rZYMD_4xY3gRcSS3p8ODO'
          );
          const commentsElement = postElement.querySelector(
            '.FHCV02u6Cp2zYL0fhQPsO'
          );

          return {
            title: titleElement ? titleElement.textContent : '',
            upvotes: upvotesElement ? upvotesElement.textContent : '',
            comments: commentsElement ? commentsElement.textContent : '',
          };
        });
      });

      // Add the additional posts to the list of top posts
      topPosts = topPosts.concat(additionalPosts);
    } else {
      // If the "Load More" button is not visible, break out of the loop
      console.log('break');
      break;
    }
  }

  // Close the browser
  await browser.close();

  return topPosts;
};

(async () => {
  const subreddit = 'AskReddit';
  const topPosts = await getTopPosts(subreddit, 2, 4);
  console.log(topPosts);
})();
