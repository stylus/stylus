import path = require('path');

/**
 * Peform a path join.
 *
 * @param {StringNode} path
 * @return {StringNode}
 * @api public
 */

export class pathjoin {
	constructor(){
  var paths = [].slice.call(arguments).map(function(path){
    return path.first.string;
  });
  return path.join.apply(null, paths).replace(/\\/g, '/');
}

	static raw = true;
}
