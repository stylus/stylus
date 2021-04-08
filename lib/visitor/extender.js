
/*!
 * Stylus - Extender
 * Copyright(c) 2014 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes');

/**
 * Initialize a new `Extender` with the given `root` Node
 *
 * This visitor performs the logic necessary to facilitate
 * the "@extend" functionality, as these must be resolved
 * _before_ buffering output.
 *
 * @param {Node} root
 * @param {Object} map
 * @api public
 */

var Extender = module.exports = function Extender(root, map) {
  Visitor.call(this, root);
  this.map = map;
};

/**
 * Inherit from `Visitor.prototype`.
 */

Extender.prototype.__proto__ = Visitor.prototype;

/**
 * extend groups in the node tree.
 *
 * @return {Node}
 * @api private
 */

Extender.prototype.extend = function(){
  this.visit(this.root);
  return this.root;
};

/**
 * Visit Root.
 */

Extender.prototype.visitRoot = function(block){
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    this.visit(block.nodes[i]);
  }
};

/**
 * Visit Block.
 */

Extender.prototype.visitBlock = Extender.prototype.visitRoot;

/**
 * Visit Group.
 */

Extender.prototype.visitGroup = function(group){
  this._extend(group, group.selectors);
  this.visit(group.block);
  group.selectors = null;
};

/**
 * Visit Media.
 */

Extender.prototype.visitMedia = function(node){
  this.visit(node.block);
};

/**
 * Visit Atrule.
 */

Extender.prototype.visitAtrule = Extender.prototype.visitMedia;

/**
 * Apply `group` extensions.
 *
 * @param {Group} group
 * @param {Array} selectors
 * @api private
 */

Extender.prototype._extend = function(group, selectors){
  var map = this.map
    , self = this;

  group.block.node.extends.forEach(function(extend){
    var groups = map[extend];
    if (!groups) throw new Error('Failed to @extend "' + extend + '"');
    selectors.forEach(function(selector){
      var node = new nodes.Selector;
      node.val = selector;
      node.inherits = false;
      groups.forEach(function(group){
        self._extend(group, selectors);
        group.push(node);
      });
    });
  });
};
