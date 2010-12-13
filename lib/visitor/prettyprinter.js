
/*!
 * CSS - PrettyPrinter
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./');

/**
 * Initialize a new `PrettyPrinter` with the given `root` Node.
 *
 * @param {Node} root
 * @api private
 */

var PrettyPrinter = module.exports = function PrettyPrinter(root) {
  Visitor.call(this, root);
};

/**
 * Inherit from `Visitor.prototype`.
 */

PrettyPrinter.prototype.__proto__ = Visitor.prototype;

/**
 * Print to stdout.
 *
 * @api public
 */

PrettyPrinter.prototype.print = function(){
  this.visit(this.root);
};
