
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
 * Tests pending.
 */

var pending = 0;

/**
 * Test the given `test`.
 *
 * @param {String} test
 */

function test(test) {
  var base = __dirname + '/cases/' + test
    , path =  base + '.styl'
    , csspath = base + '.css';
  fs.readFile(path, 'utf8', function(err, str){
    if (err) throw err;
    var paths = [__dirname + '/images', __dirname + '/cases/import.basic'];
    var options = { filename: path, paths: paths };
    if (~test.indexOf('compress')) options.compress = true;
    stylus.render(str, options, function(err, actual){
      if (err) throw err;
      fs.readFile(csspath, 'utf8', function(err, expected){
        if (err) throw err;
        expected += '\n';
        if (actual == expected) {
          --pending || done();
        } else {
          var msg = '"' + basename(path, '.in') + '" failed\n\n'
            + '\033[33mexpected:\033[0m \n' + expected + '\n\n'
            + '\033[33mactual:\033[0m \n' + actual + '\n';
          throw new Error(msg);
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
  files.forEach(function(file){
    if (/\.styl$/.test(file)) {
      ++pending;
      ++count;
      test(basename(file, '.styl'));
    }
  });
});

/**
 * Done!!!
 */

function done() {
  console.log(
      '\n  \033[90mcompleted\033[0m'
    + ' \033[32m%d\033[0m'
    + ' \033[90mtests\033[0m\n', count);
}