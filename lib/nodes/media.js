
/*!
 * Stylus - Media
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Media` with the given `val`
 *
 * @param {String} val
 * @api public
 */

var Media = module.exports = function Media(val){
  Node.call(this);
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Media.prototype.__proto__ = Node.prototype;

/**
 * Clone this node.
 *
 * @return {Media}
 * @api public
 */

Media.prototype.clone = function(parent){
  var clone = new Media;
  clone.val = this.val.clone(parent, clone);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 *
 * @return {Object}
 * @api public
 */

Media.prototype.toJSON = function(){
  return {
    __type: 'Media',
    val: this.val,
    block: this.block,
    lineno: this.lineno,
    filename: this.filename
  };
};

/**
 * Check if media block has properties.
 *
 * @return {Boolean}
 * @api public
 */

Media.prototype.__defineGetter__('hasProperties', function(){
  return hasProperties(this.block);
});

/**
 * Return @media "val".
 *
 * @return {String}
 * @api public
 */

Media.prototype.toString = function(){
  return '@media ' + this.val;
};

function hasProperties(block) {
  for (var i = 0, len = block.nodes.length; i < len; i++) {
    var node = block.nodes[i];
    switch (node.nodeName) {
      case 'property':
        return true;
      case 'group':
        return !node.hasOnlyPlaceholders && hasProperties(node.block);
      case 'block':
        return hasProperties(node);
      default:
        if (node.block) return hasProperties(node.block);
    }
  }
}
