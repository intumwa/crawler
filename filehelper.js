'use strict';

const fs = require('fs');
const { mkdir } = require('fs').promises;
const path = require('path');
const { createHmac } = require('crypto');
const util = require('./util.js');

const secret = 'abcdefg';

const truncate = (str, n) => {
  return (str.length > n) ? str.substr(0, n-1) : str;
};

const formatPath = (str) => {
  return truncate(str.replace(new RegExp('[^\\w]', 'g'), '_'), 64);
};

const checkDirectory = async (BASE_DIR, url, callback) => {
	try {
		var dir = path.join(BASE_DIR, formatPath(url));
		if (!fs.existsSync(dir)) (async () => { await mkdir(dir); })();
    let data = JSON.stringify([url, dir]);
		return callback(null, data);
	} catch (e) { return callback(e, null) }
};

const randomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) result += characters.charAt(Math.floor(Math.random() * charactersLength));
  return result;
};

const generateFileName = (browser, url) => {
  let time = new Date().toISOString(), length = 128, hash = createHmac('sha256', secret).update(formatPath(time)).digest('hex');
  let tmp;
  if (url.length > 0) tmp = `${url.split('://')[1].substring(0, length)}-${hash.substring(0, 32)}`;
  else tmp = `${randomString(length)}-${hash.substring(0, 32)}`;
  return formatPath(`${browser}-${tmp}`);
};

const removeFiles = (dir, callback) => {
  try {

    if (fs.existsSync(dir)) fs.rm(dir, { recursive: true }, (err, res) => {
      if (err) callback(err, null);
      else callback(null, res);
    });
  } catch (e) {
    console.log(e);
  }
};

const makeDir = async (BASE_DIR, url) => {
  try {

    // get the time to include in the hashed file name
    const visitTime = new Date().toISOString();

    // directory in which to save the un-compressed files
    const dirName = formatPath(`${url}-${visitTime}`);
    const dir = path.join(BASE_DIR, dirName);
    if (!fs.existsSync(dir)) (async () => { await mkdir(dir); })();

    const dirObj = { dir: dir, dirName: dirName };

    return dirObj;
  } catch (e) {
    console.log(e);
  }
};

const getDir = async (BASE_DIR, dirs, url, callback) => {
  try {

    let dir, dirName;

    const existingDir = util.searchArray(dirs, url);
    if (existingDir.length === 0) {
      const mkDir = await makeDir(BASE_DIR, url);

      dir = mkDir.dir;
      dirName = mkDir.dirName;

      dirs.push({ url: url, dir: dir, dirName: dirName });
    } else {
      dir = existingDir[0].dir;
      dirName = existingDir[0].dirName;
    }

    callback(null, { dir: dir, dirName: dirName });
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  formatPath: formatPath,
	checkDirectory: checkDirectory,
  generateFileName: generateFileName,
  removeFiles: removeFiles,
  makeDir: makeDir,
  getDir: getDir
};
