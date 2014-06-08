
/*!
 * Stylus - Normalizer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes')
  , utils = require('../utils');

/**
 * Initialize a new `Normalizer` with the given `root` Node.
 *
 * This visitor implements the first stage of the duel-stage
 * compiler, tasked with stripping the "garbage" from
 * the evaluated nodes, ditching null rules, resolving
 * ruleset selectors etc. This step performs the logic
 * necessary to facilitate the "@extend" functionality,
 * as these must be resolved _before_ buffering output.
 *
 * @param {Node} root
 * @api public
 */

var Normalizer = module.exports = function Normalizer(root, options) {
  options = options || {};
  Visitor.call(this, root);
  this.stack = [];
  this.extends = {};
  this.map = {};
};

/**
 * Inherit from `Visitor.prototype`.
 */

Normalizer.prototype.__proto__ = Visitor.prototype;

/**
 * Normalize the node tree.
 *
 * @return {Node}
 * @api private
 */

Normalizer.prototype.normalize = function(){
  // normalize cached imports
  if ('block' == this.root.nodeName) this.root.constructor = nodes.Root;
  return this.visit(this.root);
};

/**
 * Bubble up the given `node`.
 *
 * @param {Node} node
 * @api private
 */

Normalizer.prototype.bubble = function(node){
  var props = []
    , other = []
    , self = this;

  function filterProps(block) {
    block.nodes.forEach(function(node) {
      node = self.visit(node);

      switch (node.nodeName) {
        case 'property':
          props.push(node);
          break;
        case 'block':
          filterProps(node);
          break;
        default:
          other.push(node);
      }
    });
  }

  filterProps(node.block);

  if (props.length) {
    var selector = new nodes.Selector([new nodes.Literal('&')])
      , parentGroup = node.block.parent.node;
    selector.lineno = node.lineno;
    selector.filename = node.filename;
    selector.val = '&';

    var group = new nodes.Group;
    group.lineno = node.lineno;
    group.filename = node.filename;

    var block = new nodes.Block(node.block, group);
    block.lineno = node.lineno;
    block.filename = node.filename;

    props.forEach(function(prop){
      block.push(prop);
    });

    group.push(selector);
    group.block = block;

    node.block.nodes = [];
    node.block.push(group);
    other.forEach(function(n){
      node.block.push(n);
    });
    node.group = parentGroup.clone();
    node.bubbled = true;
  }
};

/**
 * Visit Root.
 */

Normalizer.prototype.visitRoot = function(block){
  var ret = new nodes.Root
    , node;

  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'null':
      case 'expression':
      case 'function':
      case 'unit':
      case 'atblock':
        continue;
      default:
        ret.push(this.visit(node));
    }
  }

  return ret;
};

/**
 * Visit Block.
 */

Normalizer.prototype.visitBlock = function(block){
  var ret = new nodes.Block
    , node;

  if (block.hasProperties) {
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = len - 1 == i;
      node = block.nodes[i];
      switch (node.nodeName) {
        case 'null':
        case 'expression':
        case 'function':
        case 'group':
        case 'unit':
        case 'atblock':
          continue;
        default:
          ret.push(this.visit(node));
      }
    }
  }

  // nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    // normalize cached imports
    if ('root' == node.nodeName) node.constructor = nodes.Block;
    ret.push(this.visit(node));
  }

  return block;
};

/**
 * Visit Group.
 */

Normalizer.prototype.visitGroup = function(group){
  var stack = this.stack
    , map = this.map
    , parts;

  // normalize interpolated selectors with comma
  group.nodes.forEach(function(selector, i){
    if (!~selector.val.indexOf(',')) return;
    if (~selector.val.indexOf('\\,')) {
      selector.val = selector.val.replace(/\\,/g, ',');
      return;
    }
    parts = selector.val.split(',');
    var root = '/' == selector.val.charAt(0)
      , part, s;
    for (var k = 0, len = parts.length; k < len; ++k){
      part = parts[k].trim();
      if (root && k > 0 && !~part.indexOf('&')) {
        part = '/' + part;
      }
      s = new nodes.Selector([part]);
      s.val = part;
      s.block = group.block;
      group.nodes[i++] = s;
    }
  });
  stack.push(group.nodes);

  var selectors = utils.compileSelectors(stack, true);

  // map for extension lookup
  selectors.forEach(function(selector){
    map[selector] = map[selector] || [];
    map[selector].push(group);
  });

  // extensions
  this.extend(group, selectors);

  group.block = this.visit(group.block);
  stack.pop();
  return group;
};

/**
 * Visit Media.
 */

Normalizer.prototype.visitMedia = function(media){
  var medias = []
    , self = this;

  function mergeQueries(block) {
    block.nodes.forEach(function(node, i){
      node = self.visit(node);

      if ('media' == node.nodeName) {
        node.val = media.val.merge(node.val);
        medias.push(node);
        block.nodes[i] = nodes.null;
      } else if (node.block) {
        mergeQueries(node.block);
      }
    });
  }

  this.bubble(media);
  mergeQueries(media.block);

  if (medias.length) {
    var block = new nodes.Block(media.block);
    block.push(media);
    medias.forEach(function(node){
      if (node.bubbled) {
        if (!media.block.parent.node) {
          node.group.block = node.block.nodes[0].block;
          node.block.nodes[0] = node.group;
        }
        media.block.parent.push(node);
      }
      block.push(node);
    });
    return block;
  } else {
    return media;
  }
}

/**
 * Visit Keyframes.
 */

Normalizer.prototype.visitKeyframes = function(node){
  var frames = node.block.nodes.filter(function(frame){
    return frame.block && frame.block.hasProperties;
  });
  node.frames = frames.length;
  return node;
};

/**
 * Apply `group` extensions.
 *
 * @param {Group} group
 * @param {Array} selectors
 * @api private
 */

Normalizer.prototype.extend = function(group, selectors){
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
        if (!group.nodes.some(function(n){ return n.val == selector })) {
          self.extend(group, selectors);
          group.push(node);
        }
      });
    });
  });
};
