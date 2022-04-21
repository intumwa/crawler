'use strict';

const groupCrawlResultsByUrl = (array, url) => {
  return Object.fromEntries(
    Array.from(new Set(array.map(({ url }) => url))).map((url) => [
      url,
      array.filter((item) => item.url === url),
    ]),
  );
};

const randInterval = (min, max) => { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
};

const searchArray = (arr, searchKey) => {
  return arr?.filter(obj => Object.keys(obj).some(key => obj[key]?.includes(searchKey)));
}

const isResponseOk = (status) => {
  return (status !== 200 && status !== 201 && status !== 202 && status !== 203 && status !== 204 && status !== 205 && status !== 206 && status !== 207 && status !== 208 && status !== 210 && status !== 226 && status !== 300 && status !== 301 && status !== 302 && status !== 303 && status !== 304 && status !== 305 && status !== 306 && status !== 307 && status !== 308 && status !== 310) ? false : true;
};

module.exports = {
  groupCrawlResultsByUrl: groupCrawlResultsByUrl,
  randomInterval: randInterval,
  searchArray: searchArray,
  isResponseOk: isResponseOk
}
