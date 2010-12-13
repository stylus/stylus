
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
  this.indents = 0;
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
  this.visit(this.root);
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
 * Visit Block.
 */

PrettyPrinter.prototype.visitBlock = function(block){
  var self = this;
  ++this.indents;
  this.visit(block.nodes, function(){
    self.print('\n');
  });
  --this.indents;
};

/**
 * Visit Variable.
 */

PrettyPrinter.prototype.visitVariable = function(variable){
  if (variable.val) {
    this.print('@' + variable.name + ': ');
    this.visit(variable.val);
  } else {
    this.print('@' + variable.name);
  }
};

/**
 * Visit Color.
 */

PrettyPrinter.prototype.visitColor = function(color){
  if (1 == color.a) {
    var n = color.r << 16
      | color.g << 8
      | color.b;
    this.print(n.toString(16));
  } else {
    this.print('rgba('
      + color.r + ', '
      + color.g + ', '
      + color.b + ', '
      + color.a
      + ')');
  }
};

/**
 * Visit Unit.
 */

PrettyPrinter.prototype.visitUnit = function(unit){
  this.print(unit.val + unit.type);
};

/**
 * Visit Selector.
 */

PrettyPrinter.prototype.visitSelector = function(selector){
  this.print(selector.val + '\n');
  this.visit(selector.block);
};

/**
 * Visit Property.
 */

PrettyPrinter.prototype.visitProperty = function(prop){
  this.print(prop.name + ' ');
  this.visit(prop.val);
};




