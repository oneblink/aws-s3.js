'use strict';

const EventEmitter = require('events');
const fs = require('fs');

const glob = require('./utils/glob').glob;

const S3_METHODS = ['listObjects', 'upload'];

function assertS3 (options) {
  const s3 = options.s3;
  if (!s3 || typeof s3 !== 'object') {
    throw new TypeError('"s3" object must be provided');
  }
  S3_METHODS.forEach((method) => {
    if (typeof s3[method] !== 'function') {
      throw new TypeError(`provided "s3" object missing "${method}" method`);
    }
  });
  return options;
}

function mergeDefaults (options) {
  options = options || {};

  return Object.assign({}, {
    cwd: process.cwd(),
    dryRun: false,
    filePaths: null,
    fs,
    prune: false,
    s3: null
  }, options);
}

function getFilePaths (options) {
  if (Array.isArray(options.filePaths)) {
    return Promise.resolve(options.filePaths.concat([]));
  }
  return glob('**/*', {
    cwd: options.cwd,
    dot: false,
    nodir: true
  });
}

function upload (options) {
  options = mergeDefaults(options);
  assertS3(options);

  const task = Object.create(EventEmitter.prototype, {});
  task.promise = getFilePaths(options)
    .then((filePaths) => {
      task.filePaths = filePaths;
    });

  return task;
}

module.exports = { upload };