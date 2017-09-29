'use strict';

require('mocha');
var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var assert = require('assert');
var rimraf = require('rimraf');
var git = require('gitty');
var firstCommit = require('./');
var repo;

var fixtures = path.join.bind(path, __dirname, 'fixtures');

describe('git-add-remote', function() {
  describe('main export', function() {
    it('should export a function', function() {
      assert.equal(typeof firstCommit, 'function');
    });

    it('should expose a "sync" method', function() {
      assert.equal(typeof firstCommit.sync, 'function');
    });
  });

  describe('async', function() {
    beforeEach(function(cb) {
      rimraf(fixtures('repo'), cb);
    })

    afterEach(function(cb) {
      rimraf(fixtures('repo1'), cb);
    })

    it('should throw an error when callback is missing', function() {
      assert.throws(function() {
        firstCommit();
      }, /expected callback to be a function/);
    });

    it('should create a git repository', function(cb) {
      firstCommit(fixtures('repo1'), function(err) {
        if (err) {
          cb(err);
          return;
        }
        verify('repo1', cb);
      });
    });

    it('should add a file', function(cb) {
      firstCommit(fixtures('repo1'), function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('repo1', function(log, files) {
          assert(Array.isArray(files));
          assert.equal(files.length, 1);
          assert.equal(files[0], 'temp.txt');
        }, cb);
      });
    });

    it('should add a first commit', function(cb) {
      firstCommit(fixtures('repo1'), function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('repo1', function(log) {
          assert(Array.isArray(log));
          assert.equal(log.length, 1);
          assert.equal(log[0].message, 'first commit');
        }, cb);
      });
    });

    it('should not add a first commit when told not to', function(cb) {
      firstCommit(fixtures('repo1'), { skipCommit: true }, function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('repo1', null, function(err) {
          assert(err);
          cb();
        })
      });
    });

    it('should customize first commit message', function(cb) {
      firstCommit(fixtures('repo1'), {message: 'foo'}, function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('repo1', function(log) {
          assert(Array.isArray(log));
          assert.equal(log.length, 1);
          assert.equal(log[0].message, 'foo');
        }, cb);
      });
    });
  });

  describe('sync', function() {
    beforeEach(function(cb) {
      rimraf(fixtures('repo2'), cb);
    })

    afterEach(function(cb) {
      rimraf(fixtures('repo2'), cb);
    })

    it('should create a git repository', function(cb) {
      firstCommit.sync(fixtures('repo2'));
      verify('repo2', cb);
    });

    it('should add a file', function(cb) {
      firstCommit.sync(fixtures('repo2'));
      verify('repo2', function(log, files) {
        assert(Array.isArray(files));
        assert.equal(files.length, 1);
        assert.equal(files[0], 'temp.txt');
      }, cb);
    });

    it('should add a first commit', function(cb) {
      firstCommit.sync(fixtures('repo2'));
      verify('repo2', function(log) {
        assert(Array.isArray(log));
        assert.equal(log.length, 1);
        assert.equal(log[0].message, 'first commit');
      }, cb);
    });

    it('should customize first commit message', function(cb) {
      firstCommit.sync(fixtures('repo2'), {message: 'foo'});
      verify('repo2', function(log) {
        assert(Array.isArray(log));
        assert.equal(log.length, 1);
        assert.equal(log[0].message, 'foo');
      }, cb);
    });

    it('should customize file name', function(cb) {
      firstCommit.sync(fixtures('repo2'), {filename: 'foo.txt'});
      verify('repo2', function(log, files) {
        assert(Array.isArray(log));
        assert.equal(log.length, 1);

        assert(Array.isArray(files));
        assert.equal(files.length, 1);
        assert.equal(files[0], 'foo.txt');
      }, cb);
    });
  });
});


function verify(dir, fn, cb) {
  var cwd = fixtures(dir);
  repo = git(cwd);
  if (typeof cb !== 'function') {
    cb = fn;
    fn = function() {};
  }

  fs.stat(fixtures(dir, '.git'), function(err, stat) {
    if (err) {
      cb(err);
      return;
    }

    assert(stat);
    assert(stat.isDirectory());

    repo.log(function(err, log) {
      if (err) {
        cb(err);
        return;
      }

      list(cwd, function(err, files, stderr) {
        if (err) {
          cb(err, null, stderr);
          return;
        }

        fn(log, files);
        cb();
      })
    });
  });
}

function list(cwd, cb) {
  cp.exec('git ls-files', {cwd: cwd}, function(err, stdout, stderr) {
    if (err) {
      cb(err, null, stderr);
      return;
    }
    cb(null, stdout.split('\n').filter(Boolean));
  });
}
