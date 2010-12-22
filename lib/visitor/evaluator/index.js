
/*!
 * CSS - Evaluator
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('../')
  , nodes = require('../../nodes')
  , Stack = require('../../stack')
  , Frame = require('../../stack/frame')
  , Scope = require('../../stack/scope')
  , operations = require('./operations');

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
  this.stack.push(this.global = new Frame(root));
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
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    block.nodes[i] = this.visit(block.nodes[i]);
  }
  return block;
};

/**
 * Visit Block.
 */

Evaluator.prototype.visitBlock = function(block){
  this.stack.push(new Frame(block));
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    block.nodes[i] = this.visit(block.nodes[i]);
  }
  this.stack.pop();
  return block;
};

/**
 * Visit Color.
 */

Evaluator.prototype.visitColor = function(color){
  return color;
};

/**
 * Visit Boolean.
 */

Evaluator.prototype.visitBoolean = function(bool){
  return bool;
};

/**
 * Visit Unit.
 */

Evaluator.prototype.visitUnit = function(unit){
  return unit;
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
 * Visit Function.
 */

Evaluator.prototype.visitFunction = function(fn){
  return new nodes.Null;
};

/**
 * Visit Selector.
 */

Evaluator.prototype.visitSelector = function(selector){
  selector.block = this.visit(selector.block);
  return selector;
};

/**
 * Visit Call.
 */

Evaluator.prototype.visitCall = function(call){
  var fn = this.stack.lookup(call.name);
  
  // Undefined function, render literal css
  if (!fn) return call;

  var ret
    , params = fn.params
    , stack = this.stack;

  this.lookup = true;
  var args = this.visit(call.args);
  this.lookup = false;

  // Inject arguments as locals
  stack.push(new Frame(fn.block));
  params.nodes.forEach(function(node, i){
    node.val = args.nodes[i] || node.val;
    if (node.val instanceof nodes.Null) {
      throw new Error('argument ' + node + ' required for ' + fn);
    }
    stack.currentFrame.scope.add(node);
  });

  // Evaluate
  this.lookup = true;
  var body = this.visit(fn.block);
  this.lookup = false;
  stack.pop();

  // Return
  if (this.isProperty) {
    ret = body.nodes[body.nodes.length - 1];
  // Mixin
  } else {
    body.nodes.forEach(function(node){
      stack.currentFrame.block.nodes.push(node);
    });
    ret = new nodes.Null;
  }

  return ret;
};

/**
 * Visit Variable.
 */

Evaluator.prototype.visitVariable = function(variable){
  if (this.lookup) {
    var val = this.stack.lookup(variable.name);
    if (!val) throw new Error('undefined variable ' + variable);
    return this.visit(val);
  } else {
    this.stack.currentFrame.scope.add(variable);
    return new nodes.Null;
  }
};

/**
 * Visit BinOp.
 */

Evaluator.prototype.visitBinOp = function(binop){
  // Special-case "is defined" psuedo binop
  if ('is defined' == binop.op) {
    if (binop.left instanceof nodes.Variable) {
      var left = this.stack.lookup(binop.left.name);
      return nodes.Boolean(left);
    } else {
      throw new Error('invalid "is defined" check on non-variable');
    }
  }

  // Visit operands
  var op = binop.op
    , left = this.visit(binop.left)
    , right = this.visit(binop.right);

  // Assume first node in expression
  while (left instanceof nodes.Expression) left = left.nodes[0];
  while (right instanceof nodes.Expression) right = right.nodes[0];

  // Discover operation type
  var type = left.constructor.name.toLowerCase()
    , ops = operations[type]
    , fn = ops && (ops[op] || operations.all[op]);

  if (!ops) throw new Error('cannot operate on ' + type);
  if (!fn) throw new Error('invalid operation ' + op + ' on ' + type);

  return this.visit(fn(left, right));
};

/**
 * Visit Expression.
 */

Evaluator.prototype.visitExpression = function(expr){
  for (var i = 0, len = expr.nodes.length; i < len; ++i) {
    expr.nodes[i] = this.visit(expr.nodes[i]);
  }
  return expr;
};

/**
 * Visit Property.
 */

Evaluator.prototype.visitProperty = function(prop){
  this.lookup = true;
  this.isProperty = true;
  prop.expr = this.visit(prop.expr);
  this.isProperty = false;
  this.lookup = false;
  return prop;
};
