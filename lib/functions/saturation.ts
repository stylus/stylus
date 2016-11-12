import nodes = require('../nodes');
import {hsla} from './hsla';
import {component} from './component';

/**
 * Return the saturation component of the given `color`,
 * or set the saturation component to the optional second `value` argument.
 *
 * Examples:
 *
 *    saturation(#00c)
 *    // => 100%
 *
 *    saturation(#00c, 50%)
 *    // => #339
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

export function saturation(color, value){
  if (value) {
    var hslaColor = color.hsla;
    return hsla(
      new nodes.Unit(hslaColor.h),
      value,
      new nodes.Unit(hslaColor.l),
      new nodes.Unit(hslaColor.a)
    )
  }
  return component(color, new nodes.StringNode('saturation'));
}

