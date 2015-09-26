var utils = require('../utils')
  , nodes = require('../nodes');

/**
 * Test if `val` matches the given `pattern`.
 *
 * Examples:
 *
 *     match('^foo(bar)?', foo)
 *     match('^foo(bar)?', foobar)
 *     match('^foo(bar)?', 'foo')
 *     match('^foo(bar)?', 'foobar')
 *     // => true
 *
 *     match('^foo(bar)?', 'bar')
 *     // => false
 *
 * @param {String} pattern
 * @param {String|Ident} val
 * @return {Boolean}
 * @api public
 */

module.exports = function match(pattern, val){
  utils.assertType(pattern, 'string', 'pattern');
  utils.assertString(val, 'val');
  var re = new RegExp(pattern.val);
  return new nodes.Boolean(re.test(val.string));
};
