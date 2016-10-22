
/*!
 * Stylus - Stack
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Stack`.
 *
 * @api private
 */

export = class Stack extends Array {
  constructor() {
  super((<any>arguments));
}

/**
 * Push the given `frame`.
 *
 * @param {Frame} frame
 * @api public
 */

push(frame){
  frame.stack = this;
  frame.parent = this.currentFrame;
  return [].push.apply(this, arguments);
};

/**
 * Return the current stack `Frame`.
 *
 * @return {Frame}
 * @api private
 */

get currentFrame(){
  return this[this.length - 1];
}

/**
 * Lookup stack frame for the given `block`.
 *
 * @param {Block} block
 * @return {Frame}
 * @api private
 */

getBlockFrame(block){
  for (var i = 0; i < this.length; ++i) {
    if (block == this[i].block) {
      return this[i];
    }
  }
}

/**
 * Lookup the given local variable `name`, relative
 * to the lexical scope of the current frame's `Block`.
 *
 * When the result of a lookup is an identifier
 * a recursive lookup is performed, defaulting to
 * returning the identifier itself.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

lookup(name){
  var block = this.currentFrame.block
    , val;

  do {
    var frame = this.getBlockFrame(block);
    if (frame && (val = frame.lookup(name))) {
      return val;
    }
  } while (block = block.parent);
}

/**
 * Custom inspect.
 *
 * @return {String}
 * @api private
 */

inspect(){
  return this.reverse().map(function(frame){
    return frame.inspect();
  }).join('\n');
}

/**
 * Return stack string formatted as:
 *
 *   at <context> (<filename>:<lineno>:<column>)
 *
 * @return {String}
 * @api private
 */

toString(){
  var block
    , node
    , buf = []
    , location
    , len = this.length;

  while (len--) {
    block = this[len].block;
    if (node = block.node) {
      location = '(' + node.filename + ':' + (node.lineno + 1) + ':' + node.column + ')';
      switch (node.nodeName) {
        case 'function':
          buf.push('    at ' + node.name + '() ' + location);
          break;
        case 'group':
          buf.push('    at "' + node.nodes[0].val + '" ' + location);
          break;
      }
    }
  }

  return buf.join('\n');
}
}
