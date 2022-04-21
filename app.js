'use strict';

const os = require('os');
const mysql = require('mysql2');
const crawler = require('./crawler.js');

const BASE_DIR = '/Users/intumwa/workspace/crawl-files';
const DB_OBJ = { host:'127.0.0.1', user: 'root', password: 'password', database: 'crawl' };
const BROWSERS = ['chromium', 'chromium-none', 'firefox', 'firefox-none', 'webkit', 'webkit-none'];
const TIMEOUT = 1 * 1000; // 5 seconds

// array of failed URLs
const failedUrls = [];

// keeping track the failed URLs to avoid unnecessary computation
const crawlFailure = async (website) => {
  failedUrls.push(website.url);
};

const crawlPromise = (website, timeout, callback) => {
  return new Promise((resolve, reject) => {
    // Set up the timeout
    const timer = setTimeout(() => {
      reject(crawlFailure(website));
    }, timeout);

    callback(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
};

const start = async (b, websites) => {
  try {
    // if we haven't crawled the sites with all the browsers yet
    // continue the crawl with the last of the remaining browsers
    if (b.length > 0) {

      const browser = b.pop();

      const promises = [];
      websites.map(async website => {

        // crawl only if the URL isn't part of the failed URLs
        if (!failedUrls.includes(website.url)) {

          // the callback on the crawler.visit is important in order
          // to receive the response before we re-run the crawl with another browser
          // if the crawl takes longer than the timeout, the promise will be rejected
          // with an error that will be handled by crawlPromise
          const promise = crawlPromise(website, TIMEOUT, (resolve, reject) => {
            crawler.visit(website.url, browser, (err, res) => {
              resolve(res);
            })
          });
          promises.push(promise);
        }
      })
      await Promise.all(promises).then(async vals => {
        console.log('dang', vals);

        // push the crawl with another browser
        await start(b, websites);
      });
    } else return;
  } catch(e) {
    console.error(e);
  }
};

// calculate the MAX_CONCURRENCY number
const getRequestCount = async () => {
  return Math.ceil(os.cpus().length * 0.85);
};

(async () => {
  try {
    const n = await getRequestCount();

    const con = mysql.createConnection(DB_OBJ);
    con.promise().query("SELECT * FROM website WHERE status = ? AND called = ? ORDER BY RAND() LIMIT ?", [ '0', 0, n ])
    .then(async ([rows,fields]) => {
      // creating a shallow copy of the browsers array
      // so that we can reload the object every time all browsers were used
      const b = [...BROWSERS];

      // update the url in the database
      // await updateRead(pool, urls);

      // push the urls to be crawled with different browsers
      await start(b, rows);
    })
    .catch(console.log)
    .then( () => con.end());
  } catch (e) {
    console.error(e);
  }
})();
