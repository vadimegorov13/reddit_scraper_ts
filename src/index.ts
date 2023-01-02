import * as fs from 'fs';
import {getPageUrl} from './page_url';
import reddit from './reddit';

(async () => {
  const subreddit: string = 'AmItheAsshole';
  const page_url: string = getPageUrl(subreddit, 2, 4);

  await reddit.init(page_url);
  const results = await reddit.getPosts(50);

  const json = JSON.stringify(results);
  fs.writeFile('data/posts.json', json, 'utf8', err => {
    if (err) return console.log(err);
    console.log('File "posts.json" written successfully\n');
  });
})();
