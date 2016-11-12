import utils = require('../utils');
import nodes = require('../nodes');

/**
 * Return the separator of the given `list`.
 *
 * Examples:
 *
 *    list1 = a b c
 *    list-separator(list1)
 *    // => ' '
 *
 *    list2 = a, b, c
 *    list-separator(list2)
 *    // => ','
 *
 * @param {Experssion} list
 * @return {StringNode}
 * @api public
 */

export = class listSeparator {
	constructor(list){
  list = utils.unwrap(list);
  return new nodes.StringNode(list.isList ? ',' : ' ');
}

	static raw = true;
}
