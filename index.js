'use strict';

const fs = require('fs');
const util = require('util');
const path = require('path');
const mkdirp = require('mkdirp');
const empty = require('empty-dir');
const isGitUrl = require('is-git-url');
const cp = require('child_process');
const git = path.resolve.bind(path, '.git');
const defaults = {
  message: 'first commit',
  file: { path: '.gitkeep', contents: '' }
};

const firstCommit = async(cwd, options, callback) => {
  const stats = util.promisify(fs.stat);
  const mkdir = util.promisify(mkdirp);
  const exec = util.promisify(cp.exec);

  if (typeof cwd !== 'string') {
    return firstCommit(process.cwd(), cwd, options);
  }

  if (typeof options === 'function') {
    return firstCommit(cwd, null, options);
  }

  const opts = Object.assign({ cwd: cwd }, options);
  const execOpts = Object.assign({}, opts.exec, { cwd: opts.cwd });

  const promise = stats(git(opts.cwd))
    .then(stat => {
      throw new Error('.git repository already exists in: ' + git(opts.cwd));
    })
    .catch(() => mkdir(opts.cwd))
    .then(async() => {
      return await exec(createArgs(opts), execOpts);
    });

  if (typeof callback === 'function') {
    promise.then(res => callback(null, res.stdout, res.stderr)).catch(callback);
    return;
  }

  return promise;
};

firstCommit.sync = function(cwd, options) {
  if (typeof cwd !== 'string') {
    return firstCommit.sync(process.cwd(), cwd);
  }

  const opts = Object.assign({ cwd: cwd }, options);
  const execOpts = Object.assign({}, opts.exec, { cwd: opts.cwd });

  if (fs.existsSync(git(opts.cwd))) {
    throw new Error('.git repository already exists in: ' + git(opts.cwd));
  }

  if (!fs.existsSync(cwd)) {
    mkdirp.sync(cwd);
  }

  return cp.execSync(createArgs(opts), execOpts);
};

function createArgs(options) {
  const opts = Object.assign({}, defaults, options);
  const args = ['git init'];
  const files = opts.files ? arrayify(opts.files).join(' ') : '.';
  let message = opts.message || 'First commit';

  if (message[0] !== '"' && message.slice(-1) !== '"') {
    message = `"${message}"`;
  }

  // backwards compatibility
  if (opts.skipCommit === true) {
    opts.commit = false;
  }

  if (opts.forceFile === true || (opts.file !== false && isEmpty(opts.cwd))) {
    args.push('touch "' + opts.file.path + '"');

    if (opts.file.contents) {
      args.push('echo "' + opts.file.contents.toString() + '" >> ' + opts.file.path);
    }
  }

  if (opts.commit !== false) {
    args.push(`git add ${files}`);
    args.push(`git commit -m ${message}`);
  }

  if (typeof opts.remote === 'string' && isGitUrl(opts.remote)) {
    args.push(`git remote add origin ${opts.remote}`);

    if (opts.push === true) {
      args.push('git push --force origin master:master');
    }
  }

  return args.join(' && ');
}

function isEmpty(cwd) {
  return empty.sync(cwd, garbage);
}

function garbage(filepath) {
  return !/(Thumbs\.db|\.DS_Store)$/i.test(filepath);
}

function arrayify(val) {
  return val != null ? (Array.isArray(val) ? val : [val]) : [];
}

firstCommit.createArgs = createArgs;
module.exports = firstCommit;
