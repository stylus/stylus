
/**
 * Module dependencies.
 */

var css = require('../')
  , nodes = css.nodes
  , str = require('fs').readFileSync(__dirname + '/images.styl', 'utf8');

css(str)
  .set('filename', 'images.styl')
  .define('url', css.url({ paths: [__dirname] }))
  .render(function(err, css){
    if (err) throw err;
    console.log(css);
  });