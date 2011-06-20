
/**
 * Module dependencies.
 */

var stylus = require('../')
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
        if (actual.trim() == expected.trim()) {
          fn();
        } else {
          fn(actual, expected);
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

  (function next() {
    curr = tests.shift();
    if (!curr) return done();
    process.stderr.write('    \033[90m' + curr + '\033[0m');
    test(curr, function(actual, expected){
      if (actual) {
        ++failures;
        console.error('\r  \033[31m✖\033[0m \033[90m' + curr + '\033[0m\n');
        diff(actual, expected);
        console.error();
      } else {
        console.error('\r  \033[36m✔\033[0m \033[90m' + curr + '\033[0m');
      }
      next();
    });
  })();
});

/**
 * Diff `actual` / `expected`.
 *
 * @param {String} actual
 * @param {String} expected
 */

function diff(actual, expected) {
  var actual = actual.split('\n')
    , expected = expected.split('\n')
    , len = largestLineIn(expected);

  console.error('  expected');
  expected.forEach(function(line, i){
    var other = actual[i]
      , pad = len - line.length
      , pad = Array(++pad).join(' ')
      , same = line == other;
    if (same) {
      console.error('  %d| %j%s | %j', i+1, line, pad, other);
    } else {
      console.error('  \033[31m%d| %j%s | %j\033[0m', i+1, line, pad, other);
    }
  });
}

/**
 * Return the length of the largest line in `lines`.
 *
 * @param {Array} lines
 * @return {Number}
 */

function largestLineIn(lines) {
  return lines.reduce(function(n, line){
    return Math.max(n, line.length);
  }, 0);
}

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