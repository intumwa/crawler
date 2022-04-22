'use strict';

const fh = require('./filehelper.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const visit = async (url, ua, BASE_DIR, dirs, callback) => {

  console.log('crawling', url, ua);

  // array to keep track of all promises in the crawler
  const promises = [];

  // dir in which to save the downloaded resources
  // if the dir does not exist, it will be created
  const dirObj = new Promise((resolve, reject) => {
    fh.getDir(BASE_DIR, dirs, url, (err, res) => {
      const directory = { directory: res };
      resolve(directory);
    });
  });
  promises.push(dirObj);

  // wait for 3 seconds
  const sleepy = sleep(3 * 1000);
  promises.push(sleepy);

  await Promise.all(promises).then(async vals => {
    let dirObject;

    vals.map(val => {
      if (val?.directory) dirObject = val?.directory;
    });

    callback(null, { url: url, browser: ua, dir: dirObject.dir, dirName: dirObject.dirName });
  });
};

module.exports = {
  visit: visit
}
