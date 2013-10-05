/**
 * Module dependencies.
 */

var Compiler = require('../visitor/compiler')
  , nodes = require('../nodes')
  , parse = require('url').parse
  , relative = require('path').relative
  , dirname = require('path').dirname
  , extname = require('path').extname
  , sep = require('path').sep
  , utils = require('../utils');

/**
 * Return a url() function with the given `options`.
 *
 * Options:
 *
 *    - `paths` resolution path(s), merged with general lookup paths
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.resolver({ paths: [__dirname + '/public'] }))
 *      .render(function(err, css){ ... })
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
  options = options || {};

  var _paths = options.paths || [];

  function url(url) {
    // Compile the url
    var compiler = new Compiler(url);
    compiler.isURL = true;
    var url = url.nodes.map(function(node){
      return compiler.visit(node);
    }).join('');

    // Parse literal 
    var url = parse(url)
      , literal = new nodes.Literal('url("' + url.href + '")')
      , paths = _paths.concat(this.paths)
      , tail = ''
      , res
      , found;

    // Absolute
    if (url.protocol) return literal;

    // Lookup
    found = utils.lookup(url.pathname, paths, '', true);

    // Failed to lookup
    if (!found) return literal;

    if (url.search) tail += url.search;
    if (url.hash) tail += url.hash;

    if (this.includeCSS && extname(found) == '.css') {
      return new nodes.Literal(found + tail);
    } else {
      res = relative(dirname(this.filename), found) + tail;
      if ('\\' == sep) res = res.replace(/\\/g, '/');
      return new nodes.Literal('url("' + res + '")');
    }
  };

  url.raw = true;
  return url;
};
