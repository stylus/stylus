
/**
 * Module dependencies.
 */

var css = require('../../')
  , should = require('../../support/should')
  , basename = require('path').basename
  , fs = require('fs');

/**
 * Test the given `test`.
 *
 * @param {String} test
 */

function test(test) {
  // TODO: remove
  if ('mixins.nested' == test) return;
  var base = __dirname + '/tests/' + test
    , path =  base + '.styl'
    , csspath = base + '.css';
  fs.readFile(path, 'utf8', function(err, str){
    if (err) throw err;
    var paths = [__dirname + '/tests/import.basic'];
    css.render(str, { filename: path, paths: paths }, function(err, actual){
      if (err) throw err;
      fs.readFile(csspath, 'utf8', function(err, expected){
        if (err) throw err;
        expected += '\n';
        if (actual != expected) {
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

fs.readdir(__dirname + '/tests', function(err, files){
  if (err) throw err;
  files.forEach(function(file){
    if (/\.styl$/.test(file)) {
      test(basename(file, '.styl'));
    }
  });
});