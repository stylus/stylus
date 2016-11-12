import utils = require('../utils');

/**
 * Remove the given `key` from the `object`.
 *
 * @param {Object} object
 * @param {StringNode} key
 * @return {Object}
 * @api public
 */

export function remove(object, key){
  utils.assertType(object, 'object', 'object');
  utils.assertString(key, 'key');
  delete object.vals[key.string];
  return object;
};
