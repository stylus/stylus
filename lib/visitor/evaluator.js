
/*!
 * CSS - Evaluator
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes')
  , Stack = require('../stack')
  , Frame = require('../stack/frame')
  , Scope = require('../stack/scope');

/**
 * Initialize a new `Evaluator` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the css output, defaults to false
 *
 * @param {Node} root
 * @api private
 */

var Evaluator = module.exports = function Evaluator(root, options) {
  options = options || {};
  Visitor.call(this, root);
  this.stack = new Stack;
  this.stack.push(this.global = new Frame(new Scope));
};

/**
 * Inherit from `Visitor.prototype`.
 */

Evaluator.prototype.__proto__ = Visitor.prototype;

/**
 * Evaluate the tree.
 *
 * @return {Node}
 * @api public
 */

Evaluator.prototype.evaluate = function(){
  return this.visit(this.root);
};

/**
 * Visit Root.
 */

Evaluator.prototype.visitRoot = function(block){
  return this.visitBlock(block);
};

/**
 * Visit Block.
 */

Evaluator.prototype.visitBlock = function(block){
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    block.nodes[i] = this.visit(block.nodes[i]);
  }
  return block;
};

/**
 * Visit Variable.
 */

Evaluator.prototype.visitVariable = function(variable){
  if (this.isProperty) {
    var val = this.stack.lookup(variable.name);
    if (!val) throw new Error('undefined variable ' + variable);
    return val;
  } else {
    this.stack.currentFrame.scope.add(variable);
    return new nodes.Null;
  }
};

/**
 * Visit Color.
 */

Evaluator.prototype.visitColor = function(color){
  return color;
};

/**
 * Visit Unit.
 */

Evaluator.prototype.visitUnit = function(unit){
  return unit;
};

/**
 * Visit Selector.
 */

Evaluator.prototype.visitSelector = function(selector){
  selector.block = this.visit(selector.block);
  return selector;
};

/**
 * Visit Keyword.
 */

Evaluator.prototype.visitKeyword = function(keyword){
  return keyword;
};

/**
 * Visit String.
 */

Evaluator.prototype.visitString = function(string){
  return string;
};

/**
 * Visit Null.
 */

Evaluator.prototype.visitNull = function(node){
  return node;
};

/**
 * Visit Property.
 */

Evaluator.prototype.visitProperty = function(prop){
  this.isProperty = true;
  for (var i = 0, len = prop.nodes.length; i < len; ++i) {
    prop.nodes[i] = this.visit(prop.nodes[i]);
  }
  this.isProperty = false;
  return prop;
};
