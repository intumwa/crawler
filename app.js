'use strict';

require('dotenv').config();

const os = require('os');
const mysql = require('mysql2');
const util = require('./util.js');
const fh = require('./filehelper.js');
const crawler = require('./crawler.js');

const BASE_DIR = process.env.BASE_DIR;
const DB_OBJ = { host:'127.0.0.1', user: 'root', password: 'password', database: 'crawl' };
const BROWSERS = ['chromium', 'chromium-none', 'firefox', 'firefox-none', 'webkit', 'webkit-none'];
const TIMEOUT = 1 * 60 * 1000; // 1 minute

// array of failed URLs
const failedUrls = [];

// array to store crawl data
const crawlData = [];

// array to keep track of existing dirs
// this is handy in keeping files for (same URL) different browsers
// under one directory that is assigned to the crawled URL
const dirs = [];

// keeping track the failed URLs to avoid unnecessary computation
const crawlFailure = async (website) => {

  // add the failed URL to the list for tracking
  failedUrls.push(website.url);

  // if it exists, get the existing directory
  // and remove all downloaded files from the URL
  const existingDir = util.searchArray(dirs, website.url);

  if (existingDir.length > 0) {
    await fh.removeFiles(existingDir[0].dir, (err, res) => {
      if (err) console.error(err);
      else console.log('removed files for failed', website.url);
    });
  }
};

const crawlPromise = (website, timeout, callback) => {
  return new Promise((resolve, reject) => {
    // Set up the timeout
    const timer = setTimeout(async () => {
      reject(await crawlFailure(website));
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

const start = async (b, data) => {
  try {
    // if we haven't crawled the sites with all the browsers yet
    // continue the crawl with the last of the remaining browsers
    if (b.length > 0) {

      const browser = b.pop();

      const promises = [];
      data.map(async item => {

        const website = item.value.website;
        const dirObj = item.value.directory;

        // crawl only if the URL isn't part of the failed URLs
        if (!failedUrls.includes(website.url)) {

          // the callback on the crawler.visit is important in order
          // to receive the response before we re-run the crawl with another browser
          // if the crawl takes longer than the timeout, the promise will be rejected
          // with an error that will be handled by crawlPromise
          const promise = crawlPromise(website, TIMEOUT, (resolve, reject) => {
            crawler.visit(website.url, browser, BASE_DIR, dirObj.dir, dirObj.dirName, TIMEOUT, (err, res) => {

              // populate the dirs array
              if (util.searchArray(dirs, website.url).length === 0) dirs.push({ url: website.url, dir: res.dir, dirName: res.dirName });

              resolve(res);
            })
          });
          promises.push(promise);
        }
      });
      await Promise.allSettled(promises).then(async vals => {
        console.log('dang', vals);

        // push the crawl with another browser
        await start(b, data);
      });
    } else return;
  } catch(e) {
    console.error(e);
  }
};

const getDirInfo = async (websites, callback) => {
  // array to keep track of mkdir promises
  const promises = [];

  await websites.map(async website => {

    const promise = new Promise(async resolve => {

      // dir in which to save the downloaded resources
      // if the dir does not exist, it will be created
      await fh.getDir(BASE_DIR, dirs, website.url, async (err, res) => {
        const dirInfo = { website: website, directory: res };
        resolve(dirInfo);
      });
    });
    promises.push(promise);
  });

  await Promise.allSettled(promises).then(vals => {
    callback(null, vals);
  }).catch(re => {
    callback(re, null);
  });
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

      await getDirInfo(rows, async (err, res) => {
        if (err) throw err;
        else {
          // push the urls to be crawled with different browsers
          await start(b, res);
        }
      });
    })
    .catch(console.log)
    .then( () => con.end());
  } catch (e) {
    console.error(e);
  }
})();
