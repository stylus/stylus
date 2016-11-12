
/*!
 * Stylus - Visitor
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Visitor` with the given `root` Node.
 *
 * @param {Node} root
 * @api private
 */

export class Visitor {
  root;
  constructor(root) {
    this.root = root;
  }

  /**
   * Visit the given `node`.
   *
   * @param {Node|Array} node
   * @api public
   */

  visit(node, fn?) {
    var method = 'visit' + node.constructor.name;
    if (this[method]) return this[method](node);
    return node;
  }
}