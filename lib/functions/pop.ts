import utils = require('../utils');

/**
 * Pop a value from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

export = class pop {
	constructor(expr) {
  expr = utils.unwrap(expr);
  return expr.nodes.pop();
}

	static raw = true;
}
