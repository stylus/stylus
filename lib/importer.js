
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
  , readFile = fs.readFile;

/**
 * Expose `Renderer`.
 */

module.exports = Importer;

/**
 * Initialize a new `Importer` with the given `path` and `options`.
 *
 * @param {String} path
 * @param {Object} options
 * @api public
 */

function Importer(path, options) {
  options = options || {};
  this.paths = (options.paths && options.paths.slice()) || [];
  this.filename = options.filename;
  this.paths.push(dirname(options.filename || '.'));
  this.options = options;
  this.path = path;
  this.literal = false;
  this.imported = true;
};

/**
 * Lookup the path. this.path should be filled with a absolute path
 * and callback (err, absolutePath) should be called.
 * If absolutePath and err are null, the @import should not be processed.
 *
 */

Importer.prototype.lookup = function(fn) {
  var path = this.path
    , name = this.path
    , found;

  try {
    // Literal
    if (~path.indexOf('.css')) {
      this.literal = true;
      if(!this.options['include css']) return fn(null, null);
    }

    // support optional .styl
    if (!this.literal && !~path.indexOf('.styl')) path += '.styl';

    // Lookup
    found = utils.lookup(path, this.paths, this.filename);
    found = found || utils.lookup(join(name, 'index.styl'), this.paths, this.filename);

    if(!found) {
      return fn(new Error('failed to locate @import file ' + path));
    }

    fn(null, this.path = found);
  } catch(err) {
    fn(err);
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

Importer.prototype.import = function(fn) {
  var self = this;
  stat(self.path, function(err, stat) {
    if(err) return fn(err);
    readFile(self.path, "utf-8", function(err, str) {
      if(err) return fn(err);
      fn(null, {
        str: str,
        literal: self.literal,
        mtime: stat.mtime
      });
    });
  });
}
