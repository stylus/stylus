import utils = require('../utils');
import nodes = require('../nodes');
import {Literal} from '../nodes/literal';

export class baseConvert {

  /**
   * Return a `Literal` `num` converted to the provided `base`, padded to `width`
   * with zeroes (default width is 2)
   * @return {Literal}
   * @api public
   */
  constructor(num: number, base: number, width: number) {
  utils.assertPresent(num, 'number');
  utils.assertPresent(base, 'base');
  num = utils.unwrap(num).nodes[0].val;
  base = utils.unwrap(base).nodes[0].val;
  width = (width && utils.unwrap(width).nodes[0].val) || 2;
  var result = Number(num).toString(base);
  while (result.length < width) {
    result = '0' + result;
  }
  return new nodes.Literal(result);
}

	static raw = true;
}
