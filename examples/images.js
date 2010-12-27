
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/images.css', 'utf8');

css(str)
  .set('filename', 'images.css')
  .render(function(err, css){
    if (err) throw err;
    console.log(css);
  });