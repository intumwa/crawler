'use strict';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const visit = async (url, browser, callback) => {
  console.log('crawling', url, browser);
  await sleep(3 * 1000);

  callback(null, { url: url, browser: browser });
};

module.exports = {
  visit: visit
}
