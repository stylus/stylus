import utils = require('../utils');

/**
 * Shift an element from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

 export class shift{
   constructor(expr){
   expr = utils.unwrap(expr);
   return expr.nodes.shift();
 }

	static raw = true;
}

