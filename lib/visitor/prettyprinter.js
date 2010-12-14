
/*!
 * CSS - PrettyPrinter
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./');

/**
 * Initialize a new `PrettyPrinter` with the given `root` Node.
 *
 * @param {Node} root
 * @api private
 */

var PrettyPrinter = module.exports = function PrettyPrinter(root) {
  Visitor.call(this, root);
  this.indents = 1;
};

/**
 * Inherit from `Visitor.prototype`.
 */

PrettyPrinter.prototype.__proto__ = Visitor.prototype;

/**
 * Print to stdout.
 *
 * @api public
 */

PrettyPrinter.prototype.output = function(){
  this.print('\n');
  this.visit(this.root);
  this.print('\n\n');
};

/**
 * Print `str` to stdout.
 *
 * @param {String} str
 * @api private
 */

PrettyPrinter.prototype.print = function(str){
  process.stdout.write(str);
};

/**
 * Return indentation string.
 *
 * @return {String}
 * @api private
 */

PrettyPrinter.prototype.__defineGetter__('indent', function(){
  return new Array(this.indents).join('  ');
});

/**
 * Visit Root.
 */

PrettyPrinter.prototype.visitRoot = function(block){
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    this.print((i ? '\n' : '') + this.indent);
    this.visit(node);
  }
};

/**
 * Visit Block.
 */

PrettyPrinter.prototype.visitBlock = function(block){
  ++this.indents;
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    this.print((i ? '\n' : '') + this.indent);
    this.visit(node);
  }
  --this.indents;
};

/**
 * Visit Variable.
 */

PrettyPrinter.prototype.visitVariable = function(variable){
  if (variable.val) {
    this.print('\x1b[32m@' + variable.name + '\x1b[0m: ');
    this.visit(variable.val);
  } else {
    this.print('\x1b[32m@' + variable.name + '\x1b[0m');
  }
};

/**
 * Visit Color.
 */

PrettyPrinter.prototype.visitColor = function(color){
  this.print('\x1b[90m' + color.toString() + '\x1b[0m');
};

/**
 * Visit Unit.
 */

PrettyPrinter.prototype.visitUnit = function(unit){
  this.print('\x1b[90m' + unit.val + unit.type + '\x1b[0m');
};

/**
 * Visit String.
 */

PrettyPrinter.prototype.visitString = function(string){
  this.print('\x1b[90m"' + string.val + '"\x1b[0m');
};

/**
 * Visit Keyword.
 */

PrettyPrinter.prototype.visitKeyword = function(keyword){
  this.print('\x1b[90m' + keyword.val + '\x1b[0m');
};

/**
 * Visit Selector.
 */

PrettyPrinter.prototype.visitSelector = function(selector){
  this.print('\n\x1b[35m' + selector.val + '\x1b[0m\n');
  this.visit(selector.block);
};

/**
 * Visit Property.
 */

PrettyPrinter.prototype.visitProperty = function(prop){
  this.print('\x1b[33m' + prop.name + '\x1b[0m ');
  for (var i = 0, len = prop.nodes.length; i < len; ++i) {
    if (i) this.print(' ');
    this.visit(prop.nodes[i]);
  }
};
