
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
    describe(name, function(){
      var path = 'test/cases/' + test + '.styl';
      var styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '');
      var css = fs.readFileSync('test/cases/' + test + '.css', 'utf8').replace(/\r/g, '').trim();

      it("should work when compiled synchron", function() {
        // Try it synchron
        var style = stylus(styl)
          .set('filename', path)
          .include(__dirname + '/images')
          .include(__dirname + '/cases/import.basic')
          .define('url', stylus.url());

        if (~test.indexOf('compress')) style.set('compress', true);
        if (~test.indexOf('include')) style.set('include css', true);

        var actual = style.render();
        actual.trim().should.equal(css);
      });

      it("should work when compiled asynchron", function(done) {
        // Try it asynchron
        var style = stylus(styl)
          .set('filename', path)
          // TODO enforce asnychron compile
          //      this should work in future
          // .set('Importer', OnlyAsyncImporter)
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
      });
    })
  });
})

var Importer = stylus.Importer;
function OnlyAsyncImporter() {
  Importer.apply(this, arguments);
}
OnlyAsyncImporter.prototype.__proto__ = Importer.prototype;
OnlyAsyncImporter.prototype.lookupSync = function() { throw new Error("asynchron importing is ensured"); };
OnlyAsyncImporter.prototype.importSync = function() { throw new Error("asynchron importing is ensured"); };
