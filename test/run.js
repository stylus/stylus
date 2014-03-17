
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
    if ('index' == name) return;

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
      if (~test.indexOf('prefix.')) style.set('prefix', 'prefix-');

      if (~test.indexOf('resolver')) {
          style.set('resolve url', true);
          style.define('url', stylus.resolver());
      }

      style.render(function(err, actual){
        if (err) throw err;
        actual.trim().should.equal(css);
      });
    })
  });
})

// converter cases

var converter = fs.readdirSync('test/converter').filter(function(file){
  return ~file.indexOf('.css');
}).map(function(file){
  return file.replace('.css', '');
});

describe('converter', function(){
  converter.forEach(function(test){
    var name = test.replace(/[-.]/g, ' ');

    it(name, function(){
      var path = 'test/converter/' + test + '.styl';
      var styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '').trim();
      var css = fs.readFileSync('test/converter/' + test + '.css', 'utf8').replace(/\r/g, '');
      stylus.convertCSS(css).trim().should.equal(styl);
    })
  });
});
