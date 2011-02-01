
/*!
 * CSS - plugin - url
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('../nodes')
  , parse = require('url').parse
  , extname = require('path').extname
  , utils = require('../utils')
  , fs = require('fs');

/**
 * Mime table.
 */

var mimes = {
    '.gif': 'image/gif'
  , '.png': 'image/png'
  , '.jpg': 'image/jpeg'
  , '.jpeg': 'image/jpeg'
};

/**
 * Return a url() function with the given `options`.
 *
 * Options:
 *
 *    - `limit` bytesize limit defaulting to 30Kb
 *    - `paths` image resolution path(s), merged with general lookup paths
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.url({ paths: [__dirname + '/public'] }))
 *      .render(function(err, css){ ... })
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
  options = options || {};

  var sizeLimit = options.limit || 30000
    , _paths = options.paths || [];

  return function(url){
    var buf
      , found
      , url = parse(url.val)
      , ext = extname(url.pathname)
      , mime = mimes[ext]
      , literal = new nodes.Literal('url("' + url.href + '")')
      , paths = _paths.concat(this.paths);

    // Not supported
    if (!mime) return literal;

    // Absolute
    if (url.protocol) return literal;

    // Lookup
    found = utils.lookup(url.pathname, paths);

    // Failed to lookup
    if (!found) return literal;

    // Read data
    buf = fs.readFileSync(found);

    // To large
    if (buf.length > sizeLimit) return literal;

    // Encode
    var str = new nodes.String('data:' + mime + ';base64,' + buf.toString('base64'))
      , args = new nodes.Expression;
    args.push(str);
    return new nodes.Call('url', args);
  }
};