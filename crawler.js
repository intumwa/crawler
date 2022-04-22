'use strict';

const fs = require('fs').promises;
const { mkdir } = require('fs').promises;
const fetch = require('node-fetch');
const { Nilsimsa } = require('nilsimsa');
const { chromium, firefox, webkit } = require('playwright');
const { base64encode, base64decode } = require('nodejs-base64');
const { createHmac } = require('crypto');
const path = require('path');
const util = require('./util.js');
const fh = require('./filehelper.js');

const secret = 'abcdefg';

const js = [];
const css = [];
const jsUrls = [];
const cssUrls = [];

let URL;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const isInternalLink = async (link) => {
  return (link.charAt(0) !== ''  && link.charAt(0) !== '#' && link.length > 3 && link.includes(URL));
  // is bigger than 0
  // does not start with #
  // can start with just characters (no :// and nothing similar to URL)
  // must include URL
};

const scrollFullPage = async (page) => {
  try {
    await page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0, counter = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          // tracking the timer, so that we stop scrolling after certain seconds
          // this is to avoid infinite scrolling like we've seen at http://yahoo.co.jp
          counter += 1;
          if (totalHeight >= scrollHeight || counter >= 50){ // 50 * 100 milliseconds (timer) = 5 seconds
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  } catch (e) {
    console.error(e);
  }
};

const saveScreenshot = async (ua, url, dir, page) => {
  try {
    await page.waitForTimeout(15000);
    await scrollFullPage(page);

    const fileName = `${fh.generateFileName(ua, url)}.png`;
    const filePath = path.join(dir, fileName);
    await page.screenshot({path: filePath, fullPage: true});
    const stats = await fs.stat(filePath);

    return { file: fileName, size: stats.size };
  } catch(e) {
    console.error(e);
  }
};

const saveHtml = async (ua, url, dir, content) => {
  try {
    const fileName = `${fh.generateFileName(ua, url)}.html`;
    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    const stats = await fs.stat(filePath);

    return { file: fileName, size: stats.size };
  } catch (e) {
    console.error(e);
  }
};

const writeResource = async (url, httpStatus, filePath, content, fileName, type) => {
  try {
    await fs.writeFile(filePath, content, 'utf8', async err => {
      if (err) console.error(err);
    });
    const hash = new Nilsimsa(base64encode(content)).digest('hex');
    const stats = await fs.stat(filePath);
    const status = (httpStatus !== '') ? httpStatus : '';

    if (type === '.js') {
      js.push({ position: (js.length+1), url: url, status: status, file: fileName, size: stats.size, hash: hash });
      jsUrls.push(url);
    } else if (type === '.css') {
      css.push({ position: (css.length+1), url: url, status: status, file: fileName, size: stats.size, hash: hash });
      cssUrls.push(url);
    }
  } catch (e) {
    console.error(e);
  }
};

const saveResource = async (ua, url, type, dir, scripts) => {
  try {
    // extract the URN of the resource for checks
    // to avoid downloading the resource twice (HTTP and HTTPs)
    let urn = url?.split('://')[1];
    urn = (urn?.length > 0) ? urn : '';

    let urls;
    if (type === '.js') urls = jsUrls;
    else if (type === '.css') urls = cssUrls;

    // const s1 = util.searchArray(urls, urn);
    // const s2 = util.searchArray(urls, urn?.split('?')[0]);

    if (url.length > 0 && !urls.includes(urn) && !urls.includes(urn.split('?')[0])) {

      const fileName = `${fh.generateFileName(ua, url)}${type}`;
      const filePath = path.join(dir, fileName);
      fetch (url).then(res => {
        if (res.status === 200) res.text().then(async text => {
          if (text.length > 0) await writeResource(url, res.status, filePath, text, fileName, type);
        });
      });
    } else {
      scripts?.forEach(async text => {
        const fileName = `${fh.generateFileName(ua, url)}${type}`;
        const filePath = path.join(dir, fileName);
        if (text.length > 0) await writeResource('', '', filePath, text, fileName, type);
      });
    }
  } catch (e) {
    console.error(e);
  }
};

const getPage = async (ua) => {
  let browser;
  let context;
  let status;

  // launching the appropriate browser depending on the request
	if (ua.includes('chromium')) browser = await chromium.launch();
  else if (ua.includes('firefox')) browser = await firefox.launch();
  else if (ua.includes('webkit')) browser = await webkit.launch();

  try {
    if (ua === 'none') {
      context = await browser.newContext({
        userAgent: 'None',
        ignoreHTTPSErrors: true
      });
    } else context = await browser.newContext({ ignoreHTTPSErrors: true });

		const page = await context.newPage();
    if (ua.includes('-none')) {
      await page.addScriptTag({ path: path.join(process.env.APP_DIR, '/none.js') });
    }

    if (ua.includes('chromium')) {
      await page.addScriptTag({ path: path.join(process.env.APP_DIR, 'webdriver.js') });
    }

    return { browser: browser, page: page };
  } catch (e) {
    console.error(e);
  }
};

const visit = async (url, ua, BASE_DIR, dir, dirName, TIMEOUT, callback) => {
  let playwrightObj;
  try {

    // keeping track of how long this crawl will take
    const t0 = performance.now();

    let status;
    URL = url;

    console.log('crawling', url, ua);

    // array to keep track of all promises in the crawler
    const promises = [];

    // to keep one function running all browsers
    // browser contexts and page opening are outsourced
    // in the getPage function
    playwrightObj = await getPage(ua);

    const page = playwrightObj.page;
    const browser = playwrightObj.browser;

    // wait for 3 seconds
    const sleepy = sleep(3 * 1000);
    promises.push(sleepy);

    // extract all JS and CSS resources downloaded by the webpage
    // during the crawl
    const response = await page.on('response', async response => {

      // keeping track of the HTTP status of the response
      // we get for the crawl of the current webpage (URL)
			status = response.status();

      // save external JS scripts located in the
      // crawled web page in separate files
			if (response.request().resourceType() === 'script') await saveResource(ua, response.url(), '.js', dir, '');

      // save external CSS scripts located in the
      // crawled web page in separate files
      if (response.request().resourceType() === 'stylesheet') await saveResource(ua, response.url(), '.css', dir, '');
		});
    promises.push(response);

    // await page.goto(`http://${url}`, { waitUntil: 'load', timeout: 100000 });
    if (!url.split('://')[1]) url = `http://${url}`;
    await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });

    // get the content of the crawled page
		const content = await page.content();
    const html = await saveHtml(ua, url, dir, content);
    promises.push(html);

    // get all links on the crawled web page
    // and filter them to save only internal links
    const links = await page.evaluate(() => Array.from(document.querySelectorAll('body a'), el => el.href));
    const urls = links?.filter(isInternalLink);
    promises.push(urls);

    // save the screenshot of the crawled web page
    const screenshot = await saveScreenshot(ua, url, dir, page);
    promises.push(screenshot);

    // save JS scripts located in the HEAD tag
    // of the crawled web page in separate files
    const headJS = await page.evaluate(() => Array.from(document.querySelectorAll('head > script'), js => js.innerHTML));
    await saveResource(ua, '', '.js', dir, headJS);
    promises.push(headJS);

    // save JS scripts located in the BODY tag
    // of the crawled web page in separate files
    const bodyJS = await page.evaluate(() => Array.from(document.querySelectorAll('body > script'), js => js.innerHTML));
    await saveResource(ua, '', '.js', dir, bodyJS);
    promises.push(bodyJS);

    // save JS scripts located in the BODY tag
    // of the crawled web page in separate files
    const headCSS = await page.evaluate(() => Array.from(document.querySelectorAll('head > style'), css => css.innerHTML));
    await saveResource(ua, '', '.css', dir, headCSS);
    promises.push(headCSS);

		// more to how we calculate the load time later
		const performanceTimingJson = await page.evaluate(() => JSON.stringify(window.performance.timing));
		const performanceTiming = JSON.parse(performanceTimingJson);
		const loadTime = await (performanceTiming.domInteractive - performanceTiming.navigationStart);
    promises.push(loadTime);

		// // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming
		// const loadDuration = window.PerformanceEntry.duration;

    await Promise.allSettled(promises).then(async vals => {
      let dirObject;

      vals.map(val => {
        // // get the playwright object so that we close the browser
        // if (val?.playwright) val?.playwright.browser.close();
      });

      playwrightObj.browser.close();

      const t1 = performance.now();
      const crawlTime = t1 - t0;

      callback(null, { url: url, browser: ua, crawlTime: crawlTime, pageLoadTime: loadTime, dir: dir, dirName: dirName, html: html, screenshot: screenshot, js: js, css: css, urls: urls });
    });
  } catch (e) {
    console.error(e);
    playwrightObj.browser.close();
    callback(e, null);
  }
};

module.exports = {
  visit: visit
}
