
/**
 * Module dependencies.
 */

var css = require('../')
  , str = require('fs').readFileSync(__dirname + '/functions.css', 'utf8');

css.render(str, { filename: 'functions.css' }, function(err, css){
  console.log(css);
});