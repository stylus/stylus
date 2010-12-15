
/*!
 * CSS - Compiler
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./');

/**
 * Initialize a new `Compiler` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the css output, defaults to false
 *
 * @param {Node} root
 * @api private
 */

var Compiler = module.exports = function Compiler(root, options) {
  options = options || {};
  this.compress = options.compress;
  Visitor.call(this, root);
};

/**
 * Inherit from `Visitor.prototype`.
 */

Compiler.prototype.__proto__ = Visitor.prototype;

/**
 * Compile to css, and callback `fn(err, css)`.
 *
 * @param {Function} fn
 * @api public
 */

Compiler.prototype.compile = function(fn){
  this.indents = 1;
  this.callback = fn;
  this.css = this.visit(this.root);
  fn(null, this.css);
};

/**
 * Return indentation string.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.__defineGetter__('indent', function(){
  return this.compress
     ? ''
     : new Array(this.indents).join('  ');
});

/**
 * Visit Root.
 */

Compiler.prototype.visitRoot = function(block){
  var arr = [];
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    arr.push(this.visit(block.nodes[i]));
  }
  return arr.join(this.compress ? '' : '\n');
};

/**
 * Visit Block.
 */

Compiler.prototype.visitBlock = function(block){
  var arr = [' {'];
  ++this.indents;
  this.blockLength = block.nodes.length;
  for (var i = 0, len = this.blockLength; i < len; ++i) {
    this.blockIndex = i;
    arr.push(this.visit(block.nodes[i]));
  }
  --this.indents;
  arr.push('}');
  return arr.join(this.compress ? '' : '\n');
};

/**
 * Visit Variable.
 */

Compiler.prototype.visitVariable = function(variable){
  return '';
};

/**
 * Visit Color.
 */

Compiler.prototype.visitColor = function(color){
  return color.toString();
};

/**
 * Visit Unit.
 */

Compiler.prototype.visitUnit = function(unit){
  return unit.val + unit.type;
};

/**
 * Visit Selector.
 */

Compiler.prototype.visitSelector = function(selector){
  return selector.val + this.visit(selector.block);
};

/**
 * Visit Keyword.
 */

Compiler.prototype.visitKeyword = function(keyword){
  return keyword.val;
};

/**
 * Visit String.
 */

Compiler.prototype.visitString = function(string){
  return '"' + string.val + '"';
};

/**
 * Visit Null.
 */

Compiler.prototype.visitNull = function(node){
  return '';
};

/**
 * Visit Property.
 */

Compiler.prototype.visitProperty = function(prop){
  var self = this
    , last = this.blockIndex == this.blockLength - 1
    , vals = prop.nodes.map(function(node){ return self.visit(node); });
  return this.indent + prop.name
    + (this.compress ? ':' + vals.join(',') : ': ' + vals.join(', '))
    + (this.compress ? (last ? '' : ';') : ';');
};
