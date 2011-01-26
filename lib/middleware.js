
/*!
 * CSS - middleware
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var stylus = require('./stylus')
  , fs = require('fs')
  , url = require('url')
  , basename = require('path').basename
  , join = require('path').join
  , ENOENT = process.ENOENT;

module.exports = function(options){
  options = options || {};

  // Accept src/dest dir
  if ('string' == typeof options) {
    options = { src: options };
  }

  // Source dir required
  var src = options.src;
  if (!src) throw new Error('stylus.middleware() requires "src" directory');

  // Default dest dir to source
  var dest = options.dest
    ? options.dest
    : src;

  // Default compile callback
  options.compile = options.compile || function(str, path, fn){
    stylus(str)
      .set('filename', path)
      .render(fn);
  };

  // Middleware
  return function(req, res, next){
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var path = url.parse(req.url).pathname;
    if (/\.css$/.test(path)) {
      var cssPath = join(dest, path)
        , stylusPath = join(src, basename(path, '.css') + '.styl');

      // Ignore ENOENT to fall through as 404
      function error(err) {
        next(ENOENT == err.error
            ? null
            : err);
      }
      
      // Compile to cssPath
      function compile() {
        fs.readFile(stylusPath, 'utf8', function(err, str){
          if (err) return error(err);
          options.compile(str, stylusPath, function(err, css){
            if (err) return next(err);
            fs.writeFile(cssPath, css, 'utf8', function(err){
              next(err);
            });
          });
        });
      }

      // Compare mtimes
      fs.stat(stylusPath, function(err, stylusStats){
        if (err) return error(err);
        fs.stat(cssPath, function(err, cssStats){
          // CSS has not been compiled, compile it!
          if (err) {
            if (ENOENT == err.errno) {
              compile();
            } else {
              next(err);
            }
          } else {
            // Source has changed, compile it
            if (stylusStats.mtime > cssStats.mtime) {
              compile();
            // Already compiled, defer serving
            } else {
              next();
            }
          }
        });
      });
    }
  }
};