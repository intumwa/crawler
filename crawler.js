'use strict';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const visit = async (url, ua, dir, dirName, callback) => {
  console.log('crawling', url, ua, dir, dirName);
  await sleep(3 * 1000);

  callback(null, { url: url, browser: ua, dir: dir, dirName: dirName });
};

module.exports = {
  visit: visit
}
