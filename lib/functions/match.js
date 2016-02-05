var utils = require('../utils')
  , nodes = require('../nodes');

/**
 * retrieves the matches when matching a `val`(string)
 * against a `pattern`(regular expression).
 *
 * Examples:
 *   $regex = '^(height|width)?([<>=]{1,})(.*)'
 *
 *   match($regex,'height>=sm')
 * 	 // => ('height>=sm' 'height' '>=' 'sm')
 * 	 // => also truthy
 *
 *   match($regex, 'lorem ipsum')
 *   // => null
 *
 * @param {String} pattern
 * @param {String|Ident} val
 * @param {String|Ident} [flags='']
 * @return {String|Null}
 * @api public
 */

module.exports = function match(pattern, val, flags){
  utils.assertType(pattern, 'string', 'pattern');
  utils.assertString(val, 'val');

  if (flags) {
    utils.assertString(val, 'string');
    flags = flags.string
  } else {
    flags = ''
  }

  var re = new RegExp(pattern.val, flags);
  return val.string.match(re);
};
