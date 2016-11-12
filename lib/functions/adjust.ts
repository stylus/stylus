import utils = require('../utils');
import {Unit} from '../nodes/unit';
import {StringNode} from '../nodes/string';

/**
 * Adjust HSL `color` `prop` by `amount`.
 *
 * @param {RGBA|HSLA} color
 * @param {StringNode} prop
 * @param {Unit} amount
 * @return {RGBA}
 * @api private
 */

export function adjust(color, prop: StringNode, amount: Unit){
  utils.assertColor(color, 'color');
  utils.assertString(prop, 'prop');
  utils.assertType(amount, 'unit', 'amount');
  var hsl = color.hsla.clone();
  var propStr = { hue: 'h', saturation: 's', lightness: 'l' }[prop.string];
  if (!prop) throw new Error('invalid adjustment property');
  var val = amount.val;
  if ('%' == amount.type){
    val = 'l' == propStr && val > 0
      ? (100 - hsl[propStr]) * val / 100
      : hsl[propStr] * (val / 100);
  }
  hsl[propStr] += val;
  return hsl.rgba;
};
