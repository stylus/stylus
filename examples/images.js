
/**
 * Module dependencies.
 */

var css = require('../')
  , nodes = css.nodes
  , str = require('fs').readFileSync(__dirname + '/images.css', 'utf8');

function url() {
  var n = 0
    , pending = 0
    , urls = {};
  return function(url){
    ++pending;
    var tok = '__images[' + ++n + ']__';
    urls[url] = { url: url, tok: tok };
    return new nodes.Ident(tok);
  }
}

css(str)
  .set('filename', 'images.css')
  .define('url', url())
  .render(function(err, css){
    if (err) throw err;
    console.log(css);
  });