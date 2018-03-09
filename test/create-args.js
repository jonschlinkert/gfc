'use strict';

require('mocha');
const path = require('path');
const assert = require('assert');
const del = require('delete');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const { createArgs } = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
const cwd = process.cwd();

describe('.createArgs', function() {
  beforeEach(cb => {
    rimraf.sync(fixtures());
    mkdirp(fixtures('temp'), cb);
  });

  afterEach(() => rimraf.sync(fixtures()));

  it('should create exec args with defaults', function() {
    const actual = createArgs({ cwd: fixtures('temp') });
    const expected = 'git init && touch ".gitkeep" && git add . && git commit -m "first commit"';
    assert.equal(actual, expected);
  });

  it('should create exec args with custom file.path', function() {
    const actual = createArgs({ file: { path: 'foo' }, cwd: fixtures('temp') });
    const expected = 'git init && touch "foo" && git add . && git commit -m "first commit"';
    assert.equal(actual, expected);
  });

  it('should create exec args with custom commit message', function() {
    const actual = createArgs({ message: 'foo', cwd: fixtures('temp') });
    const expected = 'git init && touch ".gitkeep" && git add . && git commit -m "foo"';
    assert.equal(actual, expected);
  });

  it('should add a git remote origin', function() {
    const actual = createArgs({ remote: 'https://github.com/jonschlinkert/gfc.git', cwd: fixtures('temp') });
    const expected = 'git init && touch ".gitkeep" && git add . && git commit -m "first commit" && git remote add origin https://github.com/jonschlinkert/gfc.git';
    assert.equal(actual, expected);
  });

  it('should add push command if enabled', function() {
    const actual = createArgs({ remote: 'https://github.com/jonschlinkert/gfc.git', push: true, cwd: fixtures('temp') });
    const expected = 'git init && touch ".gitkeep" && git add . && git commit -m "first commit" && git remote add origin https://github.com/jonschlinkert/gfc.git && git push --force origin master:master';
    assert.equal(actual, expected);
  });
});
