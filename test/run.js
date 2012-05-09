
/**
 * Module dependencies.
 */

var stylus = require('../')
  , fs = require('fs');

// test cases

var cases = fs.readdirSync('test/cases').filter(function(file){
  return ~file.indexOf('.styl');
}).map(function(file){
  return file.replace('.styl', '');
});

describe('integration', function(){
  cases.forEach(function(test){
    var name = test.replace(/[-.]/g, ' ');
    it(name, function(){
      var path = 'test/cases/' + test + '.styl';
      var styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '');
      var css = fs.readFileSync('test/cases/' + test + '.css', 'utf8').replace(/\r/g, '').trim();

      var style = stylus(styl)
        .set('filename', path)
        .include(__dirname + '/images')
        .include(__dirname + '/cases/import.basic')
        .define('url', stylus.url());

      if (~test.indexOf('compress')) style.set('compress', true);
      if (~test.indexOf('include')) style.set('include css', true);

      style.render(function(err, actual){
        if (err) throw err;
        actual.trim().should.equal(css);
      });

      if (test === 'introspection') {
        // By design this does not work for the import case,
        // ignore the operation.
        return;
      }

      // Rerun as an import to ensure the same functionality
      var importCache = {};
      var style = stylus('@import("' + path + '")', {_importCache: importCache})
        .set('filename', path)
        .include(__dirname + 'test/cases')
        .include(__dirname + '/images')
        .include(__dirname + '/cases/import.basic')
        .define('url', stylus.url());

      if (~test.indexOf('compress')) style.set('compress', true);

      style.render(function(err, actual){
        if (err) throw err;
        actual.trim().should.equal(css);
      });

      // And once more for cached imports testing
      var style = stylus('@import("' + path + '")', {_importCache: importCache})
        .set('filename', path)
        .include(__dirname + 'test/cases')
        .include(__dirname + '/images')
        .include(__dirname + '/cases/import.basic')
        .define('url', stylus.url());

      if (~test.indexOf('compress')) style.set('compress', true);

      style.render(function(err, actual){
        if (err) throw err;
        actual.trim().should.equal(css);
      });
    })
  });
})