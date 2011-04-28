
/**
 * Module dependencies.
 */

var stylus = require('../')
  , should = require('../support/should')
  , basename = require('path').basename
  , fs = require('fs');

/**
 * Test count.
 */

var count = 0;

/**
 * Failure count.
 */

var failures = 0;

/**
 * Test the given `test`.
 *
 * @param {String} test
 * @param {Function} fn
 */

function test(test, fn) {
  var base = __dirname + '/cases/' + test
    , path =  base + '.styl'
    , csspath = base + '.css';

  fs.readFile(path, 'utf8', function(err, str){
    if (err) throw err;

    var style = stylus(str)
      .set('filename', path)
      .include(__dirname + '/images')
      .include(__dirname + '/cases/import.basic');

    if (~test.indexOf('compress')) style.set('compress', true);

    style.render(function(err, actual){
      if (err) throw err;
      fs.readFile(csspath, 'utf8', function(err, expected){
        if (err) throw err;
        expected += '\n';
        if (actual == expected) {
          fn();
        } else {
          var msg = '\n'
            + '\033[33mexpected:\033[0m \n>>>' + expected + '<<<\n\n'
            + '\033[33mactual:\033[0m \n>>>' + actual + '<<<\n';
          fn(msg + '\n');
        }
      });
    });
  });
  return test;
};

/**
 * Auto-load and run tests.
 */

fs.readdir(__dirname + '/cases', function(err, files){
  if (err) throw err;
  var tests = []
    , curr;

  files.forEach(function(file){
    if (/\.styl$/.test(file)) {
      ++count;
      tests.push(basename(file, '.styl'));
    }
  });

  (function next(err) {
    curr = tests.shift();
    if (!curr) return done();
    process.stderr.write('    \033[90m' + curr + '\033[0m');
    test(curr, function(err){
      if (err) {
        ++failures;
        console.error('\r  \033[31m✖\033[0m \033[90m' + curr + '\033[0m');
        console.error(err);
      } else {
        console.error('\r  \033[36m✔\033[0m \033[90m' + curr + '\033[0m');
      }
      next();
    });
  })();
});

/**
 * Done!!!
 */

function done() {
  console.log();
  console.log(
      '  \033[90mcompleted\033[0m'
    + ' \033[32m%d\033[0m'
    + ' \033[90mtests\033[0m', count);

  if (failures) {
    console.error('  \033[90mfailed\033[0m'
      + ' \033[31m%d\033[0m'
      + ' \033[90mtests\033[0m', failures);
    process.exit(failures);
  }

  console.log();
}