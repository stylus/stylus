
/*!
 * CSS - Serializer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./');

/**
 * Initialize a new `Serializer` with the given `root` Node.
 *
 * @param {Node} root
 * @api public
 */

var Serializer = module.exports = function Serializer(root) {
  Visitor.call(this, root);
};

/**
 * Inherit from `Visitor.prototype`.
 */

Serializer.prototype.__proto__ = Visitor.prototype;

/**
 * Return serialized nodes.
 *
 * @api public
 */

Serializer.prototype.serialize = function(){
  return this.visit(this.root);
};

/**
 * Visit Root.
 */

Serializer.prototype.visitRoot = function(block){
  return this.visitBlock(block);
};

/**
 * Visit Block.
 */

Serializer.prototype.visitBlock = function(block){
  var arr = [];
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    arr.push(this.visit(block.nodes[i]));
  }
  return arr;
};

/**
 * Visit Variable.
 */

Serializer.prototype.visitVariable = function(variable){
  return {
      type: 'variable'
    , name: variable.name
    , val: variable.val
      ? this.visit(variable.val)
      : undefined
  };
};

/**
 * Visit Color.
 */

Serializer.prototype.visitColor = function(color){
  return {
      type: 'color'
    , val: [
        color.r
      , color.g
      , color.b
      , color.a
    ]
  };
};

/**
 * Visit Unit.
 */

Serializer.prototype.visitUnit = function(unit){
  return {
      type: 'unit'
    , unitType: unit.type
    , val: unit.val
  };
};

/**
 * Visit Selector.
 */

Serializer.prototype.visitSelector = function(selector){
  return {
      type: 'selector'
    , val: selector.val
    , block: this.visit(selector.block)
  };
};

/**
 * Visit RuleSet.
 */

Serializer.prototype.visitRuleSet = function(set){
  return {
      type: 'set'
    , nodes: set.nodes.map(function(node){
      return this.visit(node);
    }, this)
  };
};

/**
 * Visit Charset.
 */

Serializer.prototype.visitCharset = function(charset){
  return {
      type: 'charset'
    , val: this.visit(charset.val)
  };
};

/**
 * Visit String.
 */

Serializer.prototype.visitString = function(string){
  return { type: 'string', val: string.val };
};

/**
 * Visit Ident.
 */

Serializer.prototype.visitIdent = function(id){
  return { type: 'ident', val: id.val };
};

/**
 * Visit Null.
 */

Serializer.prototype.visitNull = function(node){
  return null;
};

/**
 * Visit Boolean.
 */

Serializer.prototype.visitBoolean = function(bool){
  return bool.val;
};

/**
 * Visit BinOp.
 */

Serializer.prototype.visitBinOp = function(binop){
  return {
      type: 'binop'
    , op: binop.type
    , left: this.visit(binop.left)
    , right: this.visit(binop.right)
  };
};

/**
 * Visit Call.
 */

Serializer.prototype.visitCall = function(call){
  return {
      type: 'call'
    , name: call.name
    , args: this.visit(call.args)
  };
};

/**
 * Visit Params.
 */

Serializer.prototype.visitParams = function(params){
  return params.nodes.map(function(node){
    return this.visit(node);
  }, this);
};

/**
 * Visit Import.
 */

Serializer.prototype.visitImport = function(import){
  return {
      type: 'import'
    , path: this.visit(import.path)
  };
};

/**
 * Visit Function.
 */

Serializer.prototype.visitFunction = function(fn){
  return {
      type: 'function'
    , params: this.visit(fn.params)
    , body: this.visit(fn.block)
  };
};

/**
 * Visit Expression.
 */

Serializer.prototype.visitExpression = function(expr){
  return expr.nodes.map(function(node){
    return this.visit(node);
  }, this);
};

/**
 * Visit Property.
 */

Serializer.prototype.visitProperty = function(prop){
  return {
      type: 'property'
    , name: prop.name
    , expr: this.visit(prop.expr)
  };
};
