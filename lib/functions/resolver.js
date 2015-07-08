/**
 * Module dependencies.
 */

var Compiler = require('../visitor/compiler')
  , nodes = require('../nodes')
  , parse = require('url').parse
  , relative = require('path').relative
  , join = require('path').join
  , dirname = require('path').dirname
  , extname = require('path').extname;

/**
 * Return a url() function that resolves urls.
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.resolver())
 *      .render(function(err, css){ ... })
 *
 * @return {Function}
 * @api public
 */

module.exports = function() {
  function url(url) {
    // Compile the url
    var compiler = new Compiler(url)
      , filename = url.filename;
    compiler.isURL = true;
    var url = parse(url.nodes.map(function(node){
      return compiler.visit(node);
    }).join(''));

    // Parse literal 
    var literal = new nodes.Literal('url("' + url.href + '")')
      , path = url.pathname
      , dest = this.options.dest
      , tail = ''
      , res;

    // Absolute or hash
    if (url.protocol || !path || '/' == path[0]) return literal;

    if (url.search) tail += url.search;
    if (url.hash) tail += url.hash;

    if (this.includeCSS && extname(path) == '.css') {
      return new nodes.Literal(path + tail);
    } else {
      if (dest && extname(dest) == '.css') {
        dest = dirname(dest);
      }

      res = relative(dest || dirname(this.filename), join(dirname(filename), path)) + tail;
      return new nodes.Literal('url("' + res + '")');
    }
  };

  url.raw = true;
  return url;
};
