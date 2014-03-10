
/**
 * Module dependencies.
 */

var Visitor = require('./')
  , Parser = require('../parser')
  , nodes = require('../nodes')
  , utils = require('../utils')
  , fs = require('fs');

var DepsResolver = module.exports = function DepsResolver(root, evaluator, options) {
  this.root = root;
  this.evaluator = evaluator;
  this.filename = options.filename;
  this.paths = options.paths || [];
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
  var path = this.evaluator.interpolate.call(this, node.path)
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

  // nested imports
  for (var i = 0, len = found.length; i < len; ++i) {
    if (literal) return;

    var file = found[i]
      , str = fs.readFileSync(file, 'utf-8')
      , block = new nodes.Block
      , parser = new Parser(str, utils.merge({ root: block }, this.options));

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
