# gfc [![NPM version](https://img.shields.io/npm/v/gfc.svg?style=flat)](https://www.npmjs.com/package/gfc) [![NPM monthly downloads](https://img.shields.io/npm/dm/gfc.svg?style=flat)](https://npmjs.org/package/gfc) [![Linux Build Status](https://img.shields.io/travis/jonschlinkert/gfc.svg?style=flat&label=Travis)](https://travis-ci.org/jonschlinkert/gfc) [![Windows Build Status](https://img.shields.io/appveyor/ci/jonschlinkert/gfc.svg?style=flat&label=AppVeyor)](https://ci.appveyor.com/project/jonschlinkert/gfc)

> Simple way to initialize a new git repository in an empty directory, add a file and do a first commit (or skip that part in a directory with files). Useful for unit tests and generators.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save gfc
```

Install with [yarn](https://yarnpkg.com):

```sh
$ yarn add gfc
```

## Usage

```js
var firstCommit = require('gfc');

// async
firstCommit(cwd[, options], function(err, stdout, stderr) {
  if (err) {
    console.error('exec error: ' + err);
    return;
  }
  console.log('stdout: ' + stdout);
  console.log('stderr: ' + stderr);
});

// sync
firstCommit.sync(cwd[, options]);
```

**Example**

```js
var firstCommit = require('gfc');
var dir = 'foo/bar';

firstCommit(dir, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('done!');
  }
});
```

_(NOTE: Most of the following examples will show async usage, but for the most part, the sync method works the same way without the callback)_

## What does this do?

By default, this library will:

1. create a new git repository
2. add a `temp.txt` file
3. `git add .`
4. do a first commit with the message `"first commit"`

You can [disable #2](#optionsfile), or customize other behavior via [options](#options).

## Options

### options.contents

**Type**: `string`

**Default**: `'test fixture'`

If [not disabled](#optionsfile), customize the contents of the default file added in [step 2](#what-does-this-do).

```js
var options = {contents: 'my custom contents'};

firstCommit('foo/bar', options, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('done!');
  }
});
```

### options.file

**Type**: `boolean`

**Default**: `undefined`

Disable adding the default file in [step 2](#what-does-this-do).

```js
var options = {file: false};

firstCommit('foo/bar', options, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('done!');
  }
});
```

### options.filename

**Type**: `string`

**Default**: `'temp.txt'`

If [not disabled](#optionsfile), customize the filename of the file added in [step 2](#what-does-this-do).

```js
var options = {message: 'my amazing first commit'};

firstCommit('foo/bar', options, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('done!');
  }
});
```

### options.message

**Type**: `string`

**Default**: `'first commit'`

Customize the [first commit message](#what-does-this-do).

```js
var options = {message: 'my amazing first commit'};

firstCommit('foo/bar', options, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('done!');
  }
});
```

### options.exec

**Type**: `object`

**Default**: `undefined`

Options to pass to [execSync](https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options).

```js
var options = {
  message: 'my amazing first commit',
  exec: {
    timeout: 3000,
    killSignal: 'SIGTERM'
  }
};

firstCommit.sync('foo/bar', options);
```

### options.skipCommit

**Type**: `boolean`

**Default**: `false`

Initialize the repo but don't commit

```js
var options = { skipCommit: true };

firstCommit.sync('foo/bar', options);
```

## About

### Related projects

* [git-branch](https://www.npmjs.com/package/git-branch): Get the current branch for a local git repository. | [homepage](https://github.com/jonschlinkert/git-branch "Get the current branch for a local git repository.")
* [git-user-name](https://www.npmjs.com/package/git-user-name): Get a user's name from git config at the project or global scope, depending on… [more](https://github.com/jonschlinkert/git-user-name) | [homepage](https://github.com/jonschlinkert/git-user-name "Get a user's name from git config at the project or global scope, depending on what git uses in the current context.")
* [git-username](https://www.npmjs.com/package/git-username): Get the username from a git remote origin URL. | [homepage](https://github.com/jonschlinkert/git-username "Get the username from a git remote origin URL.")
* [list-git-remotes](https://www.npmjs.com/package/list-git-remotes): List the remotes for a local git repository. Sync and async. | [homepage](https://github.com/jonschlinkert/list-git-remotes "List the remotes for a local git repository. Sync and async.")

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Jon Schlinkert**

* [github/jonschlinkert](https://github.com/jonschlinkert)
* [twitter/jonschlinkert](https://twitter.com/jonschlinkert)

### License

Copyright © 2017, [Jon Schlinkert](https://github.com/jonschlinkert).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.5.0, on April 19, 2017._
