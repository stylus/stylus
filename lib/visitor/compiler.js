
/*!
 * CSS - Compiler
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes');

/**
 * Initialize a new `Compiler` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the css output, defaults to false
 *
 * @param {Node} root
 * @api public
 */

var Compiler = module.exports = function Compiler(root, options) {
  options = options || {};
  this.compress = options.compress;
  this.indents = 1;
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
    var node = block.nodes[i];
    if (node instanceof nodes.Null
      || node instanceof nodes.Expression) continue;
    arr.push(this.visit(node));
  }
  return arr.join(this.compress ? '' : '\n');
};

/**
 * Visit Block.
 */

Compiler.prototype.visitBlock = function(block){
  var arr = [this.compress ? '{' : ' {'];
  ++this.indents;
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    if (node instanceof nodes.Null
      || node instanceof nodes.Expression) continue;
    arr.push(this.visit(node));
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
 * Visit Boolean.
 */

Compiler.prototype.visitBoolean = function(bool){
  return bool.toString();
};

/**
 * Visit Color.
 */

Compiler.prototype.visitColor = function(color){
  return color.toString();
};

/**
 * Visit HSLA.
 */

Compiler.prototype.visitHSLA = function(hsla){
  return hsla.rgba.toString();
};

/**
 * Visit Unit.
 */

Compiler.prototype.visitUnit = function(unit){
  if (this.compress) {
    if (0 == unit.val) return '0';
    if (unit.val < 1) return unit.val.toString().substr(1);
  }
  return unit.toString();
};

/**
 * Visit Selector.
 */

Compiler.prototype.visitSelector = function(selector){
  return selector.val + this.visit(selector.block);
};

/**
 * Visit Ident.
 */

Compiler.prototype.visitIdent = function(id){
  return id.val;
};

/**
 * Visit String.
 */

Compiler.prototype.visitString = function(string){
  return string.toString();
};

/**
 * Visit Null.
 */

Compiler.prototype.visitNull = function(node){
  return '';
};

/**
 * Visit Call.
 */

Compiler.prototype.visitCall = function(call){
  return call.name + '(' + this.visit(call.args) + ')';
};

/**
 * Visit Expression.
 */

Compiler.prototype.visitExpression = function(expr){
  return expr.nodes.map(function(node){
    return this.visit(node);
  }, this).join(expr.isList
      ? (this.compress ? ',' : ', ')
      : ' ');
};

/**
 * Visit Property.
 */

Compiler.prototype.visitProperty = function(prop){
  var self = this
    , val = this.visit(prop.expr);
  return this.indent + prop.name
    + (this.compress ? ':' + val : ': ' + val)
    + ';';
};
