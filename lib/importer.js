
/*!
 * Stylus - Importer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , fs = require('fs')
  , stat = fs.stat
  , statSync = fs.statSync
  , readFile = fs.readFile
  , readFileSync = fs.readFileSync;

/**
 * Expose `Importer`.
 */

module.exports = Importer;

/**
 * Initialize a new `Importer` with the given `path`, `context` and `options`.
 *
 * @param {String} path
 * @param {String} context  filename of code with contains the import
 * @param {Object} options
 * @api public
 */

function Importer(path, context, options) {
  options = options || {};
  this.paths = (options.paths && options.paths.slice()) || [];
  this.filename = options.filename;
  this.paths.push(dirname(context));
  this.options = options;
  this.path = path;
  this.literal = false;
};

/**
 * Lookup the path. this.path should be filled with a absolute path
 * and callback (err, absolutePath) should be called.
 * If absolutePath and err are null, the @import should not be processed.
 *
 */

Importer.prototype.lookupSync = function() {
  return Importer.prototype.lookup.call(this);
}
Importer.prototype.lookup = function(fn) {
  if(!fn) fn = function(err, result) {
    if(err) throw err;
    return result;
  }
  var path = this.path
    , name = this.path
    , found;

  try {
    // Literal
    if (~path.indexOf('.css')) {
      if(!this.options['include css']) return fn();
      this.literal = true;
    }

    // support optional .styl
    if (!this.literal && !~path.indexOf('.styl')) path += '.styl';

    // Lookup (TODO make it async)
    found = utils.lookup(path, this.paths, this.filename);
    found = found || utils.lookup(join(name, 'index.styl'), this.paths, this.filename);

    if(!found) {
      return fn(new Error('failed to locate @import file ' + path));
    }

    return fn(null, this.path = found);
  } catch(err) {
    return fn(err);
  }
}

/**
 * Read the file and callback with (err, result).
 * result is a object containing:
 *  - str: the file content
 *  - literal: boolean if str is raw or should be parsed
 *  - mtime: the modified time
 *
 */

Importer.prototype.importSync = function() {
  var stat = statSync(this.path);
  var str = readFileSync(this.path, "utf-8");
  return {
    str: str,
    literal: this.literal,
    mtime: stat.mtime
  }
}
Importer.prototype.import = function(fn) {
  var literal = this.literal;
  var filepath = this.path;
  stat(filepath, function(err, stat) {
    if(err) return fn(err);
    readFile(filepath, "utf-8", function(err, str) {
      if(err) return fn(err);
      fn(null, {
        str: str,
        literal: literal,
        mtime: stat.mtime
      });
    });
  });
}
