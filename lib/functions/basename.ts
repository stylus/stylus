import utils = require('../utils');
import path = require('path');

/**
 * Return the basename of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

export = function basename(p, ext){
  utils.assertString(p, 'path');
  return path.basename(p.val, ext && ext.val);
};
