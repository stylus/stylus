
/**
 * Module dependencies.
 */

var css = require('../')
  , nodes = css.nodes
  , str = require('fs').readFileSync(__dirname + '/js-functions.styl', 'utf8');

function add(a, b) {
  return a.operate('+', b);
}

function sub(a, b) {
  return a.operate('-', b);
}

css(str)
  .set('filename', 'js-functions.styl')
  .define('add', add)
  .define('sub', sub)
  .render(function(err, css){
    if (err) throw err;
    console.log(css);
  });