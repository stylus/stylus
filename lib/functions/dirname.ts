import utils = require('../utils');
import path = require('path');

/**
 * Return the dirname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

export = function dirname(p){
  utils.assertString(p, 'path');
  return path.dirname(p.val).replace(/\\/g, '/');
};
