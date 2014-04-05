
/**
 * Module dependencies.
 */

var stylus = require('../')
  , fs = require('fs');

// integration cases

addSuite('integration', readDir('test/cases'), function(test){
  var path = 'test/cases/' + test + '.styl'
    , styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '')
    , css = fs.readFileSync('test/cases/' + test + '.css', 'utf8').replace(/\r/g, '').trim()
    , style = stylus(styl)
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
}, ['index']);

// converter cases

addSuite('converter', readDir('test/converter', '.css'), function(test){
  var path = 'test/converter/' + test + '.styl'
    , styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '').trim()
    , css = fs.readFileSync('test/converter/' + test + '.css', 'utf8').replace(/\r/g, '');

  stylus.convertCSS(css).trim().should.equal(styl);
});

// deps resolver cases

addSuite('dependency resolver', readDir('test/deps-resolver'), function(test){
  var path = 'test/deps-resolver/' + test + '.styl'
    , styl = fs.readFileSync(path, 'utf8').replace(/\r/g, '')
    , deps = fs.readFileSync('test/deps-resolver/' + test + '.deps', 'utf8').replace(/\r/g, '').trim()
    , style = stylus(styl).set('filename', path);

  style.deps().join('\n').trim().should.equal(deps);
});

// JS API

describe('JS API', function(){
  it('define a variable with object as hash', function(){
    stylus('body { foo: test-obj.baz.foo.quz; bar: test-obj.bar[0].foo  }')
      .set('compress', true)
      .define('test-obj', {
        bar: [{ foo: 1 }],
        baz: {
          foo: { quz: 'quz' },
        }
      }, true).render().should.equal("body{foo:'quz';bar:1}");
  });

  it('define a variable with object as list', function(){
    stylus('body { foo: test-obj  }')
      .set('compress', true)
      .define('test-obj', {
        baz: {
          foo: { quz: 'quz' }
        }
      }).render().should.equal("body{foo:baz foo quz 'quz'}");
  });
});

function addSuite(desc, cases, fn, ignore) {
  describe(desc, function(){
    cases.forEach(function(test){
      var name = normalizeName(test);

      if (ignore && ~ignore.indexOf(name)) return;
      it(name, fn.bind(this, test));
    });
  });
}

function readDir(dir, ext){
  ext = ext || '.styl';
  return fs.readdirSync(dir).filter(function(file){
    return ~file.indexOf(ext);
  }).map(function(file){
    return file.replace(ext, '');
  });
}

function normalizeName(name){
  return name.replace(/[-.]/g, ' ');
}
