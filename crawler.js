'use strict';

const { chromium, firefox, webkit } = require('playwright');
const fh = require('./filehelper.js');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const getPage = async (ua) => {
  try {
    let browser;
    let context;
    let status;

    // launching the appropriate browser depending on the request
  	if (ua.includes('chromium')) browser = await chromium.launch();
    else if (ua.includes('firefox')) browser = await firefox.launch();
    else if (ua.includes('webkit')) browser = await webkit.launch();

    if (ua === 'none') {
      context = await browser.newContext({
        userAgent: 'None',
        ignoreHTTPSErrors: true
      });
    } else context = await browser.newContext({ ignoreHTTPSErrors: true });

		const page = await context.newPage();
    if (ua.includes('-none')) {
      await page.addScriptTag({ path: '/Users/intumwa/workspace/misc/uacrawl/none.js' });
    }

    if (ua.includes('chromium')) {
      await page.addScriptTag({ path: '/Users/intumwa/workspace/misc/uacrawl/webdriver.js' });
    }

    return new Promise(resolve => {
      const playwrightObj = { browser: browser, page: page };
      resolve({ playwright: playwrightObj });
    });
  } catch (e) {
    console.error(e);
  }
};

const visit = async (url, ua, BASE_DIR, dir, dirName, callback) => {
  try {

    // keeping track of how long this crawl will take
    const t0 = performance.now();

    console.log('crawling', url, ua);

    // array to keep track of all promises in the crawler
    const promises = [];

    // to keep one function running all browsers
    // browser contexts and page opening are outsourced
    // in the getPage function
    const playwrightObj = getPage(ua);
    promises.push(playwrightObj);

    const page = playwrightObj.page;
    const browser = playwrightObj.browser;

    // wait for 3 seconds
    const sleepy = sleep(3 * 1000);
    promises.push(sleepy);

    // // extract all JS and CSS resources downloaded by the webpage
    // // during the crawl
    // const response = await page.on('response', async response => {
    //
    //   // variable to keep track of the downloaded resources
    //   const jsResources = [], cssResources;
    //
    //   // keeping track of the HTTP status of the response
    //   // we get for the crawl of the current webpage (URL)
    //   const status = response.status();
    //
    //   // save external JS scripts located in the
    //   // crawled web page in separate files
    //   if (response.request().resourceType() === 'script') {
    //     const resource = saveResource(ua, response.url(), '.js', dir, '');
    //     jsResources.push(resource);
    //   }
    //
    //   // save external CSS scripts located in the
    //   // crawled web page in separate files
    //   if (response.request().resourceType() === 'stylesheet') {
    //     const resource = saveResource(ua, response.url(), '.css', dir, '');
    //     cssResources.push(resource);
    //   }
    // });
    // promises.push(response);

    await Promise.all(promises).then(async vals => {
      let dirObject;

      vals.map(val => {
        // get the playwright object so that we close the browser
        if (val?.playwright) val?.playwright.browser.close();
      });

      const t1 = performance.now();
      const crawlTime = t1 - t0;

      callback(null, { url: url, browser: ua, time: crawlTime, dir: dir, dirName: dirName });
    });
  } catch (e) {
    console.error(e);
    callback(e, null);
  }
};

module.exports = {
  visit: visit
}
