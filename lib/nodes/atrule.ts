/*!
 * Stylus - at-rule
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import {Node} from './node';

export class Atrule extends Node {
  block;
  segments;

  /**
   * Initialize a new at-rule node.
   */
  constructor(public type: string){
  super();
}

/**
 * Check if at-rule's block has only properties.
 */

get hasOnlyProperties(): boolean {
  if (!this.block) return false;

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
}

/**
 * Return a clone of this node.
 */
clone(parent: Node): Node {
  var clone = new Atrule(this.type);
  if (this.block) clone.block = this.block.clone(parent, clone);
  clone.segments = this.segments.map(function(node){ return node.clone(parent, clone); });
  clone.lineno = this.lineno;
  clone.column = this.column;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return a JSON representation of this node.
 */

toJSON() {
  var json: any = {
    __type: 'Atrule',
    type: this.type,
    segments: this.segments,
    lineno: this.lineno,
    column: this.column,
    filename: this.filename
  };
  if (this.block) json.block = this.block;
  return json;
};

/**
 * Return @<type>.
 */
toString(): string {
  return `@${this.type}`;
};

/**
 * Check if the at-rule's block has output nodes.
 */
get hasOutput(): boolean {
  return !!this.block && hasOutput(this.block);
}
}

function hasOutput(block) {
  var nodes = block.nodes;

  // only placeholder selectors
  if (nodes.every(function(node){
    return 'group' == node.nodeName && node.hasOnlyPlaceholders;
  })) return false;

  // something visible
  return nodes.some(function(node) {
    switch (node.nodeName) {
      case 'property':
      case 'literal':
      case 'import':
        return true;
      case 'block':
        return hasOutput(node);
      default:
        if (node.block) return hasOutput(node.block);
    }
  });
}
