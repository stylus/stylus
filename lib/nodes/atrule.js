/*!
 * Stylus - at-rule
 * Copyright(c) 2014 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new at-rule node.
 *
 * @param {String} type
 * @api public
 */

var Atrule = module.exports = function Atrule(type){
  Node.call(this);
  this.type = type;
};

/**
 * Inherit from `Node.prototype`.
 */

Atrule.prototype.__proto__ = Node.prototype;

/**
 * Check if at-rule's block has only properties.
 *
 * @return {Boolean}
 * @api public
 */

Atrule.prototype.__defineGetter__('hasOnlyProperties', function(){
  var nodes = this.block.nodes;
  for (var i = 0, len = nodes.length; i < len; ++i) {
    var nodeName = nodes[i].nodeName;
    switch(nodes[i].nodeName) {
      case 'property':
      case 'expression':
      case 'comment':
        continue;
      default:
        return false;
    }
  }
  return true;
});

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Atrule.prototype.clone = function(){
  var clone = new Atrule(this.type);
  if (this.block) clone.block = this.block.clone();
  clone.segments = this.segments.map(function(node){ return node.clone(); });
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return @<type>.
 *
 * @return {String}
 * @api public
 */

Atrule.prototype.toString = function(){
  return '@' + this.type;
};
