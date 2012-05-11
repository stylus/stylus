
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
    var name = test.replace(/[-.]/g, ' ')
      , path = 'test/cases/' + test + '.styl'
      , styl
      , css;

    function load() {
      styl = styl || fs.readFileSync(path, 'utf8').replace(/\r/g, '');
      css = css || fs.readFileSync('test/cases/' + test + '.css', 'utf8').replace(/\r/g, '').trim();
    }
    function setup(styl, options) {
      var style = stylus(styl, options)
        .set('filename', path)
        .include(__dirname + '/images')
        .include(__dirname + '/cases/import.basic')
        .define('url', stylus.url());

      if (~test.indexOf('compress')) style.set('compress', true);
      if (~test.indexOf('include')) style.set('include css', true);

      return style;
    }
    function run(style) {
      style.render(function(err, actual){
        if (err) throw err;
        actual.trim().should.equal(css);
      });
    }

    it(name, function(){
      load();

      var style = setup(styl);
      run(style);
    });

    if (test === 'introspection') {
      // By design this does not work for the import case,
      // ignore the operation.
      return;
    }

    // Rerun as an import to ensure the same functionality
    it(name + ' import', function(){
      var importCache = {};
      load();

      var style = setup('@import("' + path + '")', {_importCache: importCache});
      run(style);

      // And once more for cached imports testing
      var style = setup('@import("' + path + '")', {_importCache: importCache});
      run(style);
    })
  });
})