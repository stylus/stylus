
/**
 * Module dependencies.
 */

var Visitor = require('./')
  , Parser = require('../parser')
  , nodes = require('../nodes')
  , utils = require('../utils')
  , dirname = require('path').dirname
  , fs = require('fs');

var DepsResolver = module.exports = function DepsResolver(root, options) {
  this.root = root;
  this.filename = options.filename;
  this.paths = options.paths || [];
  this.paths.push(dirname(options.filename || '.'));
  this.deps = [];
};

DepsResolver.prototype.__proto__ = Visitor.prototype;

DepsResolver.prototype.visitRoot = function(block) {
  for (var i = 0; i < block.nodes.length; ++i) {
    this.visit(block.nodes[i]);
  }
};

DepsResolver.prototype.visitBlock = DepsResolver.prototype.visitRoot;

DepsResolver.prototype.visitImport = function(node) {
  var path = node.path.first.val
    , literal, found, oldPath;

  if (!path) return;

  literal = /\.css(?:"|$)/.test(path);

  // support optional .styl
  if (!literal && !/\.styl$/i.test(path)) {
    oldPath = path;
    path += '.styl';
  }

  // Lookup
  found = utils.find(path, this.paths, this.filename);

  // support optional index
  if (!found && oldPath) found = utils.lookupIndex(oldPath, this.paths, this.filename);

  if (!found) return;

  this.deps = this.deps.concat(found);

  if (literal) return;

  // nested imports
  for (var i = 0, len = found.length; i < len; ++i) {
    var file = found[i]
      , dir = dirname(file)
      , str = fs.readFileSync(file, 'utf-8')
      , block = new nodes.Block
      , parser = new Parser(str, utils.merge({ root: block }, this.options));

    if (!~this.paths.indexOf(dir)) this.paths.push(dir);

    try {
      block = parser.parse();
    } catch (err) {
      err.filename = file;
      err.lineno = parser.lexer.lineno;
      err.input = str;
      throw err;
    }

    this.visit(block);
  }
};

/**
 * Get dependencies.
 */

DepsResolver.prototype.resolve = function() {
  this.visit(this.root);
  return utils.uniq(this.deps);
};
