
/**
 * Module dependencies.
 */

var css = require('../')
  , nodes = css.nodes
  , str = require('fs').readFileSync(__dirname + '/images.css', 'utf8');

css(str)
  .set('filename', 'images.css')
  .define('url', function(url){
    return new nodes.String('wahoo');
  })
  .render(function(err, css){
    if (err) throw err;
    console.log(css);
  });