
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
  this.selector = [];
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
  this.buf = '';
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    if (node instanceof nodes.Null
      || node instanceof nodes.Expression
      || node instanceof nodes.Function) continue;
    var ret = this.visit(node);
    if (ret) this.buf += ret + '\n';
  }
  return this.buf;
};

/**
 * Visit Function.
 */

Compiler.prototype.visitFunction = function(fn){
  return '';
};

/**
 * Visit Variable.
 */

Compiler.prototype.visitVariable = function(variable){
  return '';
};

/**
 * Visit Charset.
 */

Compiler.prototype.visitCharset = function(charset){
  return '@charset ' + this.visit(charset.val);
};

/**
 * Visit Literal.
 */

Compiler.prototype.visitLiteral = function(lit){
  return lit.val.trim().replace(/^  /gm, '');
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
  var type = unit.type || ''
    , n = unit.val;

  // Int
  if ('px' == type) n = n.toFixed(0);

  // Compress
  if (this.compress) {
    // Zero is always '0'
    if (0 == unit.val) return '0';
    // Omit leading '0'
    if (unit.val < 1) {
      return n.toString().substr(1) + type;
    }
  }

  return n.toString() + type;
};

/**
 * Visit Group.
 */

Compiler.prototype.visitGroup = function(group){
  // Construct an array of arrays
  // representing the selector hierarchy
  this.selector.push(group.nodes.map(function(node){
    return node.val;
  }));

  // Recursive join
  function join(names) {
    return names.join(',\n');
  }

  // Join selector names
  if (group.block.hasProperties) {
    this.buf += this.selector.map(function(names){
      return join(names);
    }).join(',\n');
  }

  // Output blocks
  this.visit(group.block);
  this.selector.pop();
};

/**
 * Visit Block.
 */

Compiler.prototype.visitBlock = function(block){
  if (block.hasProperties) {
    var arr = [this.compress ? '{' : ' {'];
    ++this.indents;
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = len - 1 == i;
      var node = block.nodes[i];
      if (node instanceof nodes.Null
        || node instanceof nodes.Expression
        || node instanceof nodes.Function
        || node instanceof nodes.Group) continue;
      arr.push(this.visit(node));
    }
    --this.indents;
    arr.push('}');
    this.buf += arr.join(this.compress ? '' : '\n');
    this.buf += '\n';
  }
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    if (node instanceof nodes.Group) {
      this.visit(node);
    }
  }
};

/**
 * Visit Ident.
 */

Compiler.prototype.visitIdent = function(id){
  return id.name;
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
 * Visit Import.
 */

Compiler.prototype.visitImport = function(import){
  return '@import "' + import.path + '"';
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
    + (this.compress
        ? (this.last ? '' : ';')
        : ';');
};
