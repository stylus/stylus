import utils = require('../utils');
import path = require('path');
import {StringNode} from '../nodes/string';

/**
 * Return the basename of `path`.
 * @api public
 */

export function basename(p: StringNode, ext): String{
  utils.assertString(p, 'path');
  return path.basename(p.val, ext && ext.val);
}
