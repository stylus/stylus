import utils = require('../utils');

/**
 * Merge the object `dest` with the given args.
 *
 * @param {ObjectNode} dest
 * @param {ObjectNode} ...
 * @return {ObjectNode} dest
 * @api public
 */

export class merge {
	constructor(dest){
  utils.assertPresent(dest, 'dest');
  dest = utils.unwrap(dest).first;
  utils.assertType(dest, 'object', 'dest');

  var last = utils.unwrap(arguments[arguments.length - 1]).first
    , deep = (true === last.val) ? 1 : 0;

  for (var i = 1, len = arguments.length - deep; i < len; ++i) {
    utils.merge(dest.vals, utils.unwrap(arguments[i]).first.vals, deep);
  }
  return dest;
}

	static raw = true;
}
