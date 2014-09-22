
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
  this.map = {};
  this.currentGroup = null;
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
    var selector = new nodes.Selector([new nodes.Literal('&')]);
    selector.lineno = node.lineno;
    selector.column = node.column;
    selector.filename = node.filename;
    selector.val = '&';

    var group = new nodes.Group;
    group.lineno = node.lineno;
    group.column = node.column;
    group.filename = node.filename;

    var block = new nodes.Block(node.block, group);
    block.lineno = node.lineno;
    block.column = node.column;
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
    if (!this.currentGroup) {
      var err = new Error('Failed to find a group that closest to the @' + node.nodeName);
      err.lineno = node.lineno;
      err.column = node.column;
      throw err;
    }
    node.group = this.currentGroup.clone();
    node.bubbled = true;
  }
};

/**
 * Visit Root.
 */

Normalizer.prototype.visitRoot = function(block){
  var ret = new nodes.Root
    , node;

  for (var i = 0; i < block.nodes.length; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'null':
      case 'expression':
      case 'function':
      case 'unit':
      case 'atblock':
        continue;
      default:
        this.rootIndex = i;
        ret.push(this.visit(node));
    }
  }

  return ret;
};

/**
 * Visit Block.
 */

Normalizer.prototype.visitBlock = function(block){
  var node;

  if (block.hasProperties) {
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
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
          this.visit(node);
      }
    }
  }

  // nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    this.visit(node);
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
      s = new nodes.Selector([new nodes.Literal(part)]);
      s.val = part;
      s.block = group.block;
      group.nodes[i++] = s;
    }
  });
  stack.push(group.nodes);
  this.currentGroup = group;

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
 * Visit Function.
 */

Normalizer.prototype.visitFunction = function(){
  return nodes.null;
};

/**
 * Visit Media.
 */

Normalizer.prototype.visitMedia = function(media){
  var medias = [];

  function mergeQueries(block) {
    block.nodes.forEach(function(node, i){
      switch (node.nodeName) {
        case 'media':
          node.val = media.val.merge(node.val);
          medias.push(node);
          block.nodes[i] = nodes.null;
          break;
        case 'block':
          mergeQueries(node);
          break;
        default:
          if (node.block && node.block.nodes)
            mergeQueries(node.block);
      }
    });
  }

  mergeQueries(media.block);
  this.bubble(media);

  if (medias.length) {
    medias.forEach(function(node){
      this.root.nodes.splice(++this.rootIndex, 0, node);
      node = this.visit(node);
      if (node.bubbled) {
        node.group.block = node.block.nodes[0].block;
        node.block.nodes[0] = node.group;
      }
    }, this);
  }
  return media;
};

/**
 * Visit Supports.
 */

Normalizer.prototype.visitSupports = function(node){
  this.bubble(node);
  return node;
};

/**
 * Visit Atrule.
 */

Normalizer.prototype.visitAtrule = function(node){
  node.block = this.visit(node.block);
  return node;
};

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
    var groups = map[extend.selector];
    if (!groups) {
      var err = new Error('Failed to @extend "' + extend.selector + '"');
      err.lineno = extend.lineno;
      err.column = extend.column;
      throw err;
    }
    selectors.forEach(function(selector){
      var node = new nodes.Selector;
      node.val = selector;
      node.inherits = false;
      groups.forEach(function(group){
        self.extend(group, selectors);
        group.push(node);
      });
    });
  });
};
