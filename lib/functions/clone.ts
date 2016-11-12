import utils = require('../utils');

/**
 * Return a clone of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

export class clone {
	constructor(expr){
  utils.assertPresent(expr, 'expr');
  return expr.clone();
}

	static raw = true;
}
