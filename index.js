'use strict';

var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var extend = require('extend-shallow');
var mkdirp = require('mkdirp');
var defaults = {
  message: 'first commit',
  filename: 'temp.txt',
  contents: 'test fixture',
  exec: {}
};

module.exports = function(dir, options, cb) {
  if (typeof dir !== 'string') {
    cb = options;
    options = dir;
    dir = process.cwd();
  }

  if (typeof options === 'function') {
    cb = options;
    options = undefined;
  }

  if (typeof cb !== 'function') {
    throw new TypeError('expected callback to be a function');
  }

  var cwd = path.resolve(dir);
  var opts = extend({}, defaults, options);
  opts.exec = extend({}, defaults.exec, opts.exec, {cwd: cwd});

  if (fs.existsSync(path.join(cwd, '.git'))) {
    cb(new Error('.git repository already exists in: ' + cwd));
    return;
  }

  mkdirp(cwd, function(err) {
    if (err) {
      cb(err);
      return;
    }
    cp.exec(command(opts), opts.exec, cb);
  });
};

module.exports.sync = function(dir, options) {
  var cwd = path.resolve(dir);
  var opts = extend({}, defaults, options);
  opts.exec = extend({}, defaults.exec, opts.exec, {cwd: cwd});

  if (fs.existsSync(path.join(cwd, '.git'))) {
    throw new Error('.git repository already exists in: ' + cwd);
  }

  if (!fs.existsSync(cwd)) {
    mkdirp.sync(cwd);
  }

  cp.execSync(command(opts), opts.exec);
};

function command(options) {
  var cmd = ['git init'];

  if (options.file !== false) {
    cmd.push('touch "' + options.filename + '"');
    cmd.push('echo "' + options.contents + '" >> ' + options.filename);
  }

  cmd.push('git add .', 'git commit -m "' + options.message + '"');
  return cmd.join(' && ');
}
