import utils = require('../utils');
import path = require('path');

/**
 * Return the extname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

export = function extname(p){
  utils.assertString(p, 'path');
  return path.extname(p.val);
};
