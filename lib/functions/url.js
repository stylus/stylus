
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
 *    - `paths` image resolution path(s), defaults to CWD
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
  options = options || {};

  var sizeLimit = options.limit || 30000
    , paths = options.paths || [process.cwd()];

  return function(url){
    var buf
      , url = parse(url.val)
      , ext = extname(url.pathname)
      , mime = mimes[ext]
      , literal = new nodes.Ident('url("' + url.href + '")');

    // Not supported
    if (!mime) return literal;

    // Absolute
    if (url.protocol) return literal;

    // Lookup
    for (var i = 0; i < paths.length; ++i) {
      try {
        var path = paths[i] + '/' + url.pathname;
        buf = fs.readFileSync(path);
        break;
      } catch (err) {
        // Ignore
      }
    }

    // Failed to lookup
    if (!buf) return literal;

    // To large
    if (buf.length > sizeLimit) return literal;

    // Encode
    var str = new nodes.String('data:' + mime + ';base64,' + buf.toString('base64'))
      , args = new nodes.Expression;
    args.push(str);
    return new nodes.Call('url', args);
  }
};