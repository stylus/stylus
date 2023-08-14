
/*!
 * Stylus - stack - Scope
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

module.exports = class Scope {
  /**
   * Initialize a new `Scope`.
   *
   * @api private
   */

  constructor() {
    this.locals = {};
  }

  /**
   * Add `ident` node to the current scope.
   *
   * @param {Ident} ident
   * @api private
   */

  add(ident) {
    this.locals[ident.name] = ident.val;
  };

  /**
   * Lookup the given local variable `name`.
   *
   * @param {String} name
   * @return {Node}
   * @api private
   */

  lookup(name) {
    return this.locals.hasOwnProperty(name) ? this.locals[name] : undefined;
  };

  /**
   * Custom inspect.
   *
   * @return {String}
   * @api public
   */

  inspect() {
    var keys = Object.keys(this.locals).map(function (key) { return '@' + key; });
    return '[Scope'
      + (keys.length ? ' ' + keys.join(', ') : '')
      + ']';
  };
};
