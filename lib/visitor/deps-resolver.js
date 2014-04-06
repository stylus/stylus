
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
  this.functions = {};
  this.deps = [];
};

DepsResolver.prototype.__proto__ = Visitor.prototype;

DepsResolver.prototype.visitRoot = function(block) {
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    this.visit(block.nodes[i]);
  }
};

DepsResolver.prototype.visitGroup = function(node) {
  this.visit(node.block);
};

DepsResolver.prototype.visitIdent = function(ident) {
  this.visit(ident.val);
};

DepsResolver.prototype.visitIf = function(node) {
  this.visit(node.block);
  this.visit(node.cond);
  for (var i = 0, len = node.elses.length; i < len; ++i) {
    this.visit(node.elses[i]);
  }
};

DepsResolver.prototype.visitFunction = function(fn) {
  this.functions[fn.name] = fn.block;
};

DepsResolver.prototype.visitCall = function(call) {
  if (call.name in this.functions) this.visit(this.functions[call.name]);
  if (call.block) this.visit(call.block);
};

DepsResolver.prototype.visitBlock = DepsResolver.prototype.visitRoot;

DepsResolver.prototype.visitExpression = DepsResolver.prototype.visitRoot;

DepsResolver.prototype.visitMedia = DepsResolver.prototype.visitGroup;

DepsResolver.prototype.visitEach = DepsResolver.prototype.visitGroup;

DepsResolver.prototype.visitAtblock = DepsResolver.prototype.visitGroup;

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
