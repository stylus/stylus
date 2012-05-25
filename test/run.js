
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
    it(name, function(done){
      var path = 'test/cases/' + test + '.styl';
      var styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '');
      var css = fs.readFileSync('test/cases/' + test + '.css', 'utf8').replace(/\r/g, '').trim();

      // Try it synchron
      var styleSync = stylus(styl)
        .set('filename', path)
        .include(__dirname + '/images')
        .include(__dirname + '/cases/import.basic')
        .define('url', stylus.url());

      if (~test.indexOf('compress')) styleSync.set('compress', true);
      if (~test.indexOf('include')) styleSync.set('include css', true);

      var actualSync = styleSync.render();
      actualSync.trim().should.equal(css);

      // Try it asynchron
      var style = stylus(styl)
        .set('filename', path)
        .include(__dirname + '/images')
        .include(__dirname + '/cases/import.basic')
        .define('url', stylus.url());

      if (~test.indexOf('compress')) style.set('compress', true);
      if (~test.indexOf('include')) style.set('include css', true);

      style.render(function(err, actual){
        if (err) return done(err);
        actual.trim().should.equal(css);
        done();
      });
    })
  });
})
