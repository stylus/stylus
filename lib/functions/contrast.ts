import utils = require('../utils');
import {blend} from './blend';
import {luminosity} from './luminosity';
import {Literal, ObjectNode, Unit, RGBA, HSLA, Null} from '../nodes';

/**
 * Returns the contrast ratio object between `top` and `bottom` colors,
 * based on http://leaverou.github.io/contrast-ratio/
 * and https://github.com/LeaVerou/contrast-ratio/blob/gh-pages/color.js#L108
 *
 * Examples:
 *
 *     contrast(#000, #fff).ratio
 *     => 21
 *
 *     contrast(#000, rgba(#FFF, 0.5))
 *     => { "ratio": "13.15;", "error": "7.85", "min": "5.3", "max": "21" }
 *
 * @param {RGBA|HSLA} top
 * @param {RGBA|HSLA} [bottom=#fff]
 * @return {Object}
 * @api public
 */

export function contrast(top, bottom): Literal | ObjectNode {
  if (!(top instanceof RGBA) && !(top instanceof HSLA)) {
    return new Literal('contrast(' + (top.isNull ? '' : top.toString()) + ')');
  }
  var result = new ObjectNode();
  top = top.rgba;
  bottom = bottom || new RGBA(255, 255, 255, 1);
  utils.assertColor(bottom);
  bottom = bottom.rgba;
  function contrast(top, bottom) {
    if (1 > top.a) {
      top = blend(top, bottom);
    }
    var l1 = luminosity(bottom).val + 0.05
      , l2 = luminosity(top).val + 0.05
      , ratio = l1 / l2;

    if (l2 > l1) {
      ratio = 1 / ratio;
    }
    return Math.round(ratio * 10) / 10;
  }

  function processChannel(topChannel, bottomChannel) {
    return Math.min(Math.max(0, (topChannel - bottomChannel * bottom.a) / (1 - bottom.a)), 255);
  }

  if (1 <= bottom.a) {
    var resultRatio = new Unit(contrast(top, bottom));
    result.set('ratio', resultRatio);
    result.set('error', new Unit(0));
    result.set('min', resultRatio);
    result.set('max', resultRatio);
  } else {
    var onBlack = contrast(top, blend(bottom, new RGBA(0, 0, 0, 1)))
      , onWhite = contrast(top, blend(bottom, new RGBA(255, 255, 255, 1)))
      , max = Math.max(onBlack, onWhite);
    var closest = new RGBA(
      processChannel(top.r, bottom.r),
      processChannel(top.g, bottom.g),
      processChannel(top.b, bottom.b),
      1
    );
    var min = contrast(top, blend(bottom, closest));

    result.set('ratio', new Unit(Math.round((min + max) * 50) / 100));
    result.set('error', new Unit(Math.round((max - min) * 50) / 100));
    result.set('min', new Unit(min));
    result.set('max', new Unit(max));
  }
  return result;
}
