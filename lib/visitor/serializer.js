
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
 * @api private
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
    , val: this.visit(variable.val)
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
 * Visit String.
 */

Serializer.prototype.visitString = function(string){
  return { type: 'string', val: string.val };
};

/**
 * Visit Property.
 */

Serializer.prototype.visitProperty = function(prop){
  var self = this;
  return {
      type: 'property'
    , name: prop.name
    , values: prop.nodes.map(function(node){ return self.visit(node); })
  };
};
