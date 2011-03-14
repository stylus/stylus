
/**
 * Module dependencies.
 */

var stylus = require('../')
  , nodes = stylus.nodes
  , path = __dirname + '/images.styl'
  , str = require('fs').readFileSync(path, 'utf8');

// the paths option is merged with the general options
// so it is completely optional, however this now allows us to use
// url(sprite.gif) instead of url(images/sprite.gif) 
stylus(str)
  .set('filename', path)
  .define('url', stylus.url({ paths: [__dirname + '/images'] }))
  .render(function(err, css){
    if (err) throw err;
    console.log(css);
  });