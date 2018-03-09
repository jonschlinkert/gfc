'use strict';

require('mocha');
const fs = require('fs');
const util = require('util');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');
const rimraf = require('rimraf');
const git = require('gitty');
const firstCommit = require('..');
const fixtures = path.join.bind(path, __dirname, 'fixtures');
let repo;

describe('git-add-remote', function() {
  beforeEach(() => rimraf.sync(fixtures()));
  afterEach(() => rimraf.sync(fixtures()));

  describe('async', function() {
    it('should throw an error when .git directory exists', function(cb) {
      firstCommit(fixtures('temp'), (err, stdout, stderr) => {
        if (err) return cb(err);

        firstCommit(fixtures('temp'), err => {
          assert(err);

          if (!(err instanceof Error)) {
            cb(new Error('expected an error'));
            return;
          }
          cb();
        });
      });
    });

    it('should create a git repository', function(cb) {
      firstCommit(fixtures('temp'), function(err) {
        if (err) {
          cb(err);
          return;
        }
        verify('temp', cb);
      });
    });

    it('should add a file', function(cb) {
      firstCommit(fixtures('temp'), function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('temp', function(log, files) {
          assert(Array.isArray(files));
          assert.equal(files.length, 1);
          assert.equal(files[0], '.gitkeep');
        }, cb);
      });
    });

    it('should add a first commit', function(cb) {
      firstCommit(fixtures('temp'), function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('temp', function(log) {
          assert(Array.isArray(log));
          assert.equal(log.length, 1);
          assert.equal(log[0].message, 'first commit');
        }, cb);
      });
    });

    it('should not add a first commit when told not to', function(cb) {
      firstCommit(fixtures('temp'), { skipCommit: true }, function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('temp', null, function(err) {
          assert(err);
          cb();
        });
      });
    });

    it('should customize first commit message', function(cb) {
      firstCommit(fixtures('temp'), {message: 'foo'}, function(err) {
        if (err) {
          cb(err);
          return;
        }

        verify('temp', function(log) {
          assert(Array.isArray(log));
          assert.equal(log.length, 1);
          assert.equal(log[0].message, 'foo');
        }, cb);
      });
    });
  });

  describe('promise', function() {
    const verifyP = util.promisify(verify);

    it('should throw an error when .git directory exists', function() {
      return firstCommit(fixtures('temp')).then(() => {
        return firstCommit(fixtures('temp'))
          .then(() => new Error('expected an error'))
          .catch(() => {});
      });
    });

    it('should create a git repository', function(cb) {
      return firstCommit(fixtures('temp')).then(() => verify('temp', cb));
    });

    it('should add a file', function(cb) {
      return firstCommit(fixtures('temp'))
        .then(() => {
          verify('temp', function(log, files) {
            assert(Array.isArray(files));
            assert.equal(files.length, 1);
            assert.equal(files[0], '.gitkeep');
          }, cb);
        });
    });

    it('should add a first commit', function(cb) {
      return firstCommit(fixtures('temp'))
        .then(() => {
          verify('temp', function(log, files) {
            assert(Array.isArray(log));
            assert.equal(log.length, 1);
            assert.equal(log[0].message, 'first commit');
          }, cb);
        });
    });

    it('should customize first commit message', function(cb) {
      return firstCommit(fixtures('temp'), { message: 'foo' })
        .then(() => {
          verify('temp', function(log, files) {
            assert(Array.isArray(log));
            assert.equal(log.length, 1);
            assert.equal(log[0].message, 'foo');
          }, cb);
        });
    });

    it('should disable first commit', function(cb) {
      return firstCommit(fixtures('temp'), { commit: false })
        .then(() => verifyP('temp'))
        .catch(err => assert(err))
        .then(cb);
    });
  });

  describe('sync', function() {
    it('should create a git repository', function(cb) {
      firstCommit.sync(fixtures('temp'));
      verify('temp', cb);
    });

    it('should add a file', function(cb) {
      firstCommit.sync(fixtures('temp'));
      verify('temp', function(log, files) {
        assert(Array.isArray(files));
        assert.equal(files.length, 1);
        assert.equal(files[0], '.gitkeep');
      }, cb);
    });

    it('should add a first commit', function(cb) {
      firstCommit.sync(fixtures('temp'));
      verify('temp', function(log) {
        assert(Array.isArray(log));
        assert.equal(log.length, 1);
        assert.equal(log[0].message, 'first commit');
      }, cb);
    });

    it('should customize first commit message', function(cb) {
      firstCommit.sync(fixtures('temp'), {message: 'foo'});
      verify('temp', function(log) {
        assert(Array.isArray(log));
        assert.equal(log.length, 1);
        assert.equal(log[0].message, 'foo');
      }, cb);
    });

    it('should customize file name', function(cb) {
      firstCommit.sync(fixtures('temp'), { file: { path: '.gitkeep' } });
      verify('temp', function(log, files) {
        assert(Array.isArray(log));
        assert.equal(log.length, 1);

        assert(Array.isArray(files));
        assert.equal(files.length, 1);
        assert.equal(files[0], '.gitkeep');
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
      });
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
