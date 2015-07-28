
/*!
 * Stylus - Evaluator - built-in functions
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Compiler = require('../visitor/compiler')
  , nodes = require('../nodes')
  , utils = require('../utils')
  , Image = require('./image')
  , units = require('../units')
  , colors = require('../colors')
  , path = require('path')
  , fs = require('fs');

/**
 * Color component name map.
 */

var componentMap = {
    red: 'r'
  , green: 'g'
  , blue: 'b'
  , alpha: 'a'
  , hue: 'h'
  , saturation: 's'
  , lightness: 'l'
};

/**
 * Color component unit type map.
 */

var unitMap = {
    hue: 'deg'
  , saturation: '%'
  , lightness: '%'
};

/**
 * Color type map.
 */

var typeMap = {
    red: 'rgba'
  , blue: 'rgba'
  , green: 'rgba'
  , alpha: 'rgba'
  , hue: 'hsla'
  , saturation: 'hsla'
  , lightness: 'hsla'
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l,a component values.
 *
 * Examples:
 *
 *    hsla(10deg, 50%, 30%, 0.5)
 *    // => HSLA
 *
 *    hsla(#ffcc00)
 *    // => HSLA
 *
 * @param {RGBA|HSLA|Unit} hue
 * @param {Unit} saturation
 * @param {Unit} lightness
 * @param {Unit} alpha
 * @return {HSLA}
 * @api public
 */

exports.hsla = function hsla(hue, saturation, lightness, alpha){
  switch (arguments.length) {
    case 1:
      utils.assertColor(hue);
      return hue.hsla;
    case 2:
      utils.assertColor(hue);
      var color = hue.hsla;
      utils.assertType(saturation, 'unit', 'alpha');
      var alpha = saturation.clone();
      if ('%' == alpha.type) alpha.val /= 100;
      return new nodes.HSLA(
          color.h
        , color.s
        , color.l
        , alpha.val);
    default:
      utils.assertType(hue, 'unit', 'hue');
      utils.assertType(saturation, 'unit', 'saturation');
      utils.assertType(lightness, 'unit', 'lightness');
      utils.assertType(alpha, 'unit', 'alpha');
      var alpha = alpha.clone();
      if (alpha && '%' == alpha.type) alpha.val /= 100;
      return new nodes.HSLA(
          hue.val
        , saturation.val
        , lightness.val
        , alpha.val);
  }
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l component values.
 *
 * Examples:
 *
 *    hsl(10, 50, 30)
 *    // => HSLA
 *
 *    hsl(#ffcc00)
 *    // => HSLA
 *
 * @param {Unit|HSLA|RGBA} hue
 * @param {Unit} saturation
 * @param {Unit} lightness
 * @return {HSLA}
 * @api public
 */

exports.hsl = function hsl(hue, saturation, lightness){
  if (1 == arguments.length) {
    utils.assertColor(hue, 'color');
    return hue.hsla;
  } else {
    return exports.hsla(
        hue
      , saturation
      , lightness
      , new nodes.Unit(1));
  }
};

/**
 * Return type of `node`.
 *
 * Examples:
 * 
 *    type(12)
 *    // => 'unit'
 *
 *    type(#fff)
 *    // => 'color'
 *
 *    type(type)
 *    // => 'function'
 *
 *    type(unbound)
 *    typeof(unbound)
 *    type-of(unbound)
 *    // => 'ident'
 *
 * @param {Node} node
 * @return {String}
 * @api public
 */

exports.type =
exports.typeof =
exports['type-of'] = function type(node){
  utils.assertPresent(node, 'expression');
  return node.nodeName;
};

/**
 * Return component `name` for the given `color`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} name
 * @return {Unit}
 * @api public
 */

exports.component = function component(color, name) {
  utils.assertColor(color, 'color');
  utils.assertString(name, 'name');
  var name = name.string
    , unit = unitMap[name]
    , type = typeMap[name]
    , name = componentMap[name];
  if (!name) throw new Error('invalid color component "' + name + '"');
  return new nodes.Unit(color[type][name], unit);
};

/**
 * Return the basename of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.basename = function basename(p, ext){
  utils.assertString(p, 'path');
  return path.basename(p.val, ext && ext.val);
};

/**
 * Return the dirname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.dirname = function dirname(p){
  utils.assertString(p, 'path');
  return path.dirname(p.val).replace(/\\/g, '/');
};

/**
 * Return the extname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.extname = function extname(p){
  utils.assertString(p, 'path');
  return path.extname(p.val);
};

/**
 * Peform a path join.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

(exports.pathjoin = function pathjoin(){
  var paths = [].slice.call(arguments).map(function(path){
    return path.first.string;
  });
  return path.join.apply(null, paths).replace(/\\/g, '/');
}).raw = true;

/**
 * Return the red component of the given `color`,
 * or set the red component to the optional second `value` argument.
 *
 * Examples:
 *
 *    red(#c00)
 *    // => 204
 *
 *    red(#000, 255)
 *    // => #f00
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

exports.red = function red(color, value){
  color = color.rgba;
  if (value) {
    return exports.rgba(
      value,
      new nodes.Unit(color.g),
      new nodes.Unit(color.b),
      new nodes.Unit(color.a)
    );
  }
  return new nodes.Unit(color.r, '');
};

/**
 * Return the green component of the given `color`,
 * or set the green component to the optional second `value` argument.
 *
 * Examples:
 *
 *    green(#0c0)
 *    // => 204
 *
 *    green(#000, 255)
 *    // => #0f0
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

exports.green = function green(color, value){
  color = color.rgba;
  if (value) {
    return exports.rgba(
      new nodes.Unit(color.r),
      value,
      new nodes.Unit(color.b),
      new nodes.Unit(color.a)
    );
  }
  return new nodes.Unit(color.g, '');
};

/**
 * Return the blue component of the given `color`,
 * or set the blue component to the optional second `value` argument.
 *
 * Examples:
 *
 *    blue(#00c)
 *    // => 204
 *
 *    blue(#000, 255)
 *    // => #00f
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

exports.blue = function blue(color, value){
  color = color.rgba;
  if (value) {
    return exports.rgba(
      new nodes.Unit(color.r),
      new nodes.Unit(color.g),
      value,
      new nodes.Unit(color.a)
    );
  }
  return new nodes.Unit(color.b, '');
};

/**
 * Return the alpha component of the given `color`,
 * or set the alpha component to the optional second `value` argument.
 *
 * Examples:
 *
 *    alpha(#fff)
 *    // => 1
 *
 *    alpha(rgba(0,0,0,0.3))
 *    // => 0.3
 *
 *    alpha(#fff, 0.5)
 *    // => rgba(255,255,255,0.5)
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

exports.alpha = function alpha(color, value){
  color = color.rgba;
  if (value) {
    return exports.rgba(
      new nodes.Unit(color.r),
      new nodes.Unit(color.g),
      new nodes.Unit(color.b),
      value
    );
  }
  return new nodes.Unit(color.a, '');
};

/**
 * Return the hue component of the given `color`,
 * or set the hue component to the optional second `value` argument.
 *
 * Examples:
 *
 *    hue(#00c)
 *    // => 240deg
 *
 *    hue(#00c, 90deg)
 *    // => #6c0
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

exports.hue = function hue(color, value){
  if (value) {
    var hslaColor = color.hsla;
    return exports.hsla(
      value,
      new nodes.Unit(hslaColor.s),
      new nodes.Unit(hslaColor.l),
      new nodes.Unit(hslaColor.a)
    )
  }
  return exports.component(color, new nodes.String('hue'));
};

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

exports.saturation = function saturation(color, value){
  if (value) {
    var hslaColor = color.hsla;
    return exports.hsla(
      new nodes.Unit(hslaColor.h),
      value,
      new nodes.Unit(hslaColor.l),
      new nodes.Unit(hslaColor.a)
    )
  }
  return exports.component(color, new nodes.String('saturation'));
};

/**
 * Return the lightness component of the given `color`,
 * or set the lightness component to the optional second `value` argument.
 *
 * Examples:
 *
 *    lightness(#00c)
 *    // => 100%
 *
 *    lightness(#00c, 80%)
 *    // => #99f
 *
 * @param {RGBA|HSLA} color
 * @param {Unit} [value]
 * @return {Unit|RGBA}
 * @api public
 */

exports.lightness = function lightness(color, value){
  if (value) {
    var hslaColor = color.hsla;
    return exports.hsla(
      new nodes.Unit(hslaColor.h),
      new nodes.Unit(hslaColor.s),
      value,
      new nodes.Unit(hslaColor.a)
    )
  }
  return exports.component(color, new nodes.String('lightness'));
};

/**
 * Return a `RGBA` from the r,g,b,a channels.
 *
 * Examples:
 *
 *    rgba(255,0,0,0.5)
 *    // => rgba(255,0,0,0.5)
 *
 *    rgba(255,0,0,1)
 *    // => #ff0000
 *
 *    rgba(#ffcc00, 50%)
 *    // rgba(255,204,0,0.5)
 *
 * @param {Unit|RGBA|HSLA} red
 * @param {Unit} green
 * @param {Unit} blue
 * @param {Unit} alpha
 * @return {RGBA}
 * @api public
 */

exports.rgba = function rgba(red, green, blue, alpha){
  switch (arguments.length) {
    case 1:
      utils.assertColor(red);
      return red.rgba;
    case 2:
      utils.assertColor(red);
      var color = red.rgba;
      utils.assertType(green, 'unit', 'alpha');
      alpha = green.clone();
      if ('%' == alpha.type) alpha.val /= 100;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , alpha.val);
    default:
      utils.assertType(red, 'unit', 'red');
      utils.assertType(green, 'unit', 'green');
      utils.assertType(blue, 'unit', 'blue');
      utils.assertType(alpha, 'unit', 'alpha');
      var r = '%' == red.type ? Math.round(red.val * 2.55) : red.val
        , g = '%' == green.type ? Math.round(green.val * 2.55) : green.val
        , b = '%' == blue.type ? Math.round(blue.val * 2.55) : blue.val;

      alpha = alpha.clone();
      if (alpha && '%' == alpha.type) alpha.val /= 100;
      return new nodes.RGBA(
          r
        , g
        , b
        , alpha.val);
  }
};

/**
 * Return a `RGBA` from the r,g,b channels.
 *
 * Examples:
 *
 *    rgb(255,204,0)
 *    // => #ffcc00
 *
 *    rgb(#fff)
 *    // => #fff
 *
 * @param {Unit|RGBA|HSLA} red
 * @param {Unit} green
 * @param {Unit} blue
 * @return {RGBA}
 * @api public
 */

exports.rgb = function rgb(red, green, blue){
  switch (arguments.length) {
    case 1:
      utils.assertColor(red);
      var color = red.rgba;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , 1);
    default:
      return exports.rgba(
          red
        , green
        , blue
        , new nodes.Unit(1));
  }
};

/**
 * Blend the `top` color over the `bottom`
 *
 * Examples:
 *
 *     blend(rgba(#FFF, 0.5), #000)
 *     // => #808080
 * 
 *     blend(rgba(#FFDE00,.42), #19C261)
 *     // => #7ace38
 * 
 *     blend(rgba(lime, 0.5), rgba(red, 0.25))
 *     // => rgba(128,128,0,0.625)
 *
 * @param {RGBA|HSLA} top
 * @param {RGBA|HSLA} [bottom=#fff]
 * @return {RGBA}
 * @api public
 */

exports.blend = function blend(top, bottom){
  // TODO: different blend modes like overlay etc.
  utils.assertColor(top);
  top = top.rgba;
  bottom = bottom || new nodes.RGBA(255, 255, 255, 1);
  utils.assertColor(bottom);
  bottom = bottom.rgba;

  return new nodes.RGBA(
    top.r * top.a + bottom.r * (1 - top.a),
    top.g * top.a + bottom.g * (1 - top.a),
    top.b * top.a + bottom.b * (1 - top.a),
    top.a + bottom.a - top.a * bottom.a);
};

/**
 * Returns the relative luminance of the given `color`,
 * see http://www.w3.org/TR/WCAG20/#relativeluminancedef
 *
 * Examples:
 *
 *     luminosity(white)
 *     // => 1
 * 
 *     luminosity(#000)
 *     // => 0
 * 
 *     luminosity(red)
 *     // => 0.2126
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.luminosity = function luminosity(color){
  utils.assertColor(color);
  color = color.rgba;
  function processChannel(channel) {
    channel = channel / 255;
    return (0.03928 > channel)
      ? channel / 12.92
      : Math.pow(((channel + 0.055) / 1.055), 2.4);
  }
  return new nodes.Unit(
    0.2126 * processChannel(color.r)
    + 0.7152 * processChannel(color.g)
    + 0.0722 * processChannel(color.b)
  );
}

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

exports.contrast = function contrast(top, bottom){
  if ('rgba' != top.nodeName && 'hsla' != top.nodeName) {
    return new nodes.Literal('contrast(' + (top.isNull ? '' : top.toString()) + ')');
  }
  var result = new nodes.Object();
  top = top.rgba;
  bottom = bottom || new nodes.RGBA(255, 255, 255, 1);
  utils.assertColor(bottom);
  bottom = bottom.rgba;
  function contrast(top, bottom) {
    if (1 > top.a) {
      top = exports.blend(top, bottom);
    }
    var l1 = exports.luminosity(bottom).val + 0.05
      , l2 = exports.luminosity(top).val + 0.05
      , ratio = l1 / l2;

    if (l2 > l1) {
      ratio = 1 / ratio;
    }
    return Math.round(ratio * 10) / 10;
  }

  if (1 <= bottom.a) {
    var resultRatio = new nodes.Unit(contrast(top, bottom));
    result.set('ratio', resultRatio);
    result.set('error', new nodes.Unit(0));
    result.set('min', resultRatio);
    result.set('max', resultRatio);
  } else {
    var onBlack = contrast(top, exports.blend(bottom, new nodes.RGBA(0, 0, 0, 1)))
      , onWhite = contrast(top, exports.blend(bottom, new nodes.RGBA(255, 255, 255, 1)))
      , max = Math.max(onBlack, onWhite);
    function processChannel(topChannel, bottomChannel) {
      return Math.min(Math.max(0, (topChannel - bottomChannel * bottom.a) / (1 - bottom.a)), 255);
    }
    var closest = new nodes.RGBA(
      processChannel(top.r, bottom.r),
      processChannel(top.g, bottom.g),
      processChannel(top.b, bottom.b),
      1
    );
    var min = contrast(top, exports.blend(bottom, closest));

    result.set('ratio', new nodes.Unit(Math.round((min + max) * 50) / 100));
    result.set('error', new nodes.Unit(Math.round((max - min) * 50) / 100));
    result.set('min', new nodes.Unit(min));
    result.set('max', new nodes.Unit(max));
  }
  return result;
}

/**
 * Returns the transparent version of the given `top` color,
 * as if it was blend over the given `bottom` color.
 *
 * Examples:
 *
 *     transparentify(#808080)
 *     => rgba(0,0,0,0.5)
 *
 *     transparentify(#414141, #000)
 *     => rgba(255,255,255,0.25)
 *
 *     transparentify(#91974C, #F34949, 0.5)
 *     => rgba(47,229,79,0.5)
 *
 * @param {RGBA|HSLA} top
 * @param {RGBA|HSLA} [bottom=#fff]
 * @param {Unit} [alpha]
 * @return {RGBA}
 * @api public
 */
exports.transparentify = function transparentify(top, bottom, alpha){
  utils.assertColor(top);
  top = top.rgba;
  // Handle default arguments
  bottom = bottom || new nodes.RGBA(255, 255, 255, 1);
  if (!alpha && bottom && !bottom.rgba) {
    alpha = bottom;
    bottom = new nodes.RGBA(255, 255, 255, 1);
  }
  utils.assertColor(bottom);
  bottom = bottom.rgba;
  var bestAlpha = ['r', 'g', 'b'].map(function(channel){
    return (top[channel] - bottom[channel]) / ((0 < (top[channel] - bottom[channel]) ? 255 : 0) - bottom[channel]);
  }).sort(function(a, b){return a < b;})[0];
  if (alpha) {
    utils.assertType(alpha, 'unit', 'alpha');
    if ('%' == alpha.type) {
      bestAlpha = alpha.val / 100;
    } else if (!alpha.type) {
      bestAlpha = alpha = alpha.val;
    }
  }
  bestAlpha = Math.max(Math.min(bestAlpha, 1), 0);
  // Calculate the resulting color
  function processChannel(channel) {
    if (0 == bestAlpha) {
      return bottom[channel]
    } else {
      return bottom[channel] + (top[channel] - bottom[channel]) / bestAlpha
    }
  }
  return new nodes.RGBA(
    processChannel('r'),
    processChannel('g'),
    processChannel('b'),
    Math.round(bestAlpha * 100) / 100
  );
}

/**
 * Convert a .json file into stylus variables or object.
 * Nested variable object keys are joined with a dash (-)
 *
 * Given this sample media-queries.json file:
 * {
 *   "small": "screen and (max-width:400px)",
 *   "tablet": {
 *     "landscape": "screen and (min-width:600px) and (orientation:landscape)",
 *     "portrait": "screen and (min-width:600px) and (orientation:portrait)"
 *   }
 * }
 *
 * Examples:
 *
 *    json('media-queries.json')
 *
 *    @media small
 *    // => @media screen and (max-width:400px)
 *
 *    @media tablet-landscape
 *    // => @media screen and (min-width:600px) and (orientation:landscape)
 *
 *    vars = json('vars.json', { hash: true })
 *    body
 *      width: vars.width
 *
 * @param {String} path
 * @param {Boolean} [local]
 * @param {String} [namePrefix]
 * @api public
*/

exports.json = function(path, local, namePrefix){
  utils.assertString(path, 'path');

  // lookup
  path = path.string;
  var found = utils.lookup(path, this.options.paths, this.options.filename)
    , options = (local && 'object' == local.nodeName) && local;

  if (!found) {
    // optional JSON file
    if (options && options.get('optional').toBoolean().isTrue) {
      return nodes.null;
    }
    throw new Error('failed to locate .json file ' + path);
  }

  // read
  var json = JSON.parse(fs.readFileSync(found, 'utf8'));

  if (options) {
    return convert(json, options);
  } else {
    exports['-old-json'].call(this, json, local, namePrefix);
  }

  function convert(obj, options){
    var ret = new nodes.Object()
      , leaveStrings = options.get('leave-strings').toBoolean();

    for (var key in obj) {
      var val = obj[key];
      if ('object' == typeof val) {
        ret.set(key, convert(val, options));
      } else {
        val = utils.coerce(val);
        if ('string' == val.nodeName && leaveStrings.isFalse) {
          val = parseString(val.string);
        }
        ret.set(key, val);
      }
    }
    return ret;
  }
};

/**
 * Old `json` BIF.
 *
 * @api private
 */

exports['-old-json'] = function(json, local, namePrefix){
  if (namePrefix) {
    utils.assertString(namePrefix, 'namePrefix');
    namePrefix = namePrefix.val;
  } else {
    namePrefix = '';
  }
  local = local ? local.toBoolean() : new nodes.Boolean(local);
  var scope = local.isTrue ? this.currentScope : this.global.scope;

  convert(json);
  return;

  function convert(obj, prefix){
    prefix = prefix ? prefix + '-' : '';
    for (var key in obj){
      var val = obj[key];
      var name = prefix + key;
      if ('object' == typeof val) {
        convert(val, name);
      } else {
        val = utils.coerce(val);
        if ('string' == val.nodeName) val = parseString(val.string);
        scope.add({ name: namePrefix + name, val: val });
      }
    }
  }
};

/**
*  Use the given `plugin`
*  
*  Examples:
*
*     use("plugins/add.js")
*
*     width add(10, 100)
*     // => width: 110
*/

exports.use = function(plugin, options){
  utils.assertString(plugin, 'plugin');

  if (options) {
    utils.assertType(options, 'object', 'options');
    options = parseObject(options);
  }

  // lookup
  plugin = plugin.string;
  var found = utils.lookup(plugin, this.options.paths, this.options.filename);
  if (!found) throw new Error('failed to locate plugin file "' + plugin + '"');

  // use
  var fn = require(path.resolve(found));
  if ('function' != typeof fn) {
    throw new Error('plugin "' + plugin + '" does not export a function');
  }
  this.renderer.use(fn(options || this.options));
}

/**
 * Unquote the given `string`.
 *
 * Examples:
 *
 *    unquote("sans-serif")
 *    // => sans-serif
 *
 *    unquote(sans-serif)
 *    // => sans-serif
 *
 * @param {String|Ident} string
 * @return {Literal}
 * @api public
 */

exports.unquote = function unquote(string){
  utils.assertString(string, 'string');
  return new nodes.Literal(string.string);
};

/**
 * Like `unquote` but tries to convert
 * the given `str` to a Stylus node.
 *
 * @param {String} str
 * @return {Node}
 * @api public
 */

exports.convert = function convert(str){
  utils.assertString(str, 'str');
  return parseString(str.string);
};

/**
 * Assign `type` to the given `unit` or return `unit`'s type.
 *
 * @param {Unit} unit
 * @param {String|Ident} type
 * @return {Unit}
 * @api public
 */

exports.unit = function unit(unit, type){
  utils.assertType(unit, 'unit', 'unit');

  // Assign
  if (type) {
    utils.assertString(type, 'type');
    return new nodes.Unit(unit.val, type.string);
  } else {
    return unit.type || '';
  }
};

/**
 * Lookup variable `name` or return Null.
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

exports.lookup = function lookup(name){
  utils.assertType(name, 'string', 'name');
  var node = this.lookup(name.val);
  if (!node) return nodes.null;
  return this.visit(node);
};

/**
 * Set a variable `name` on current scope.
 *
 * @param {String} name
 * @param {Expression} expr
 * @api public
 */

exports.define = function define(name, expr){
  utils.assertType(name, 'string', 'name');
  expr = utils.unwrap(expr);
  var scope = this.currentScope;
  var node = new nodes.Ident(name.val, expr);
  scope.add(node);
  return nodes.null;
};

/**
 * Perform `op` on the `left` and `right` operands.
 *
 * @param {String} op
 * @param {Node} left
 * @param {Node} right
 * @return {Node}
 * @api public
 */

exports.operate = function operate(op, left, right){
  utils.assertType(op, 'string', 'op');
  utils.assertPresent(left, 'left');
  utils.assertPresent(right, 'right');
  return left.operate(op.val, right);
};

/**
 * Test if `val` matches the given `pattern`.
 *
 * Examples:
 *
 *     match('^foo(bar)?', foo)
 *     match('^foo(bar)?', foobar)
 *     match('^foo(bar)?', 'foo')
 *     match('^foo(bar)?', 'foobar')
 *     // => true
 *
 *     match('^foo(bar)?', 'bar')
 *     // => false
 *
 * @param {String} pattern
 * @param {String|Ident} val
 * @return {Boolean}
 * @api public
 */

exports.match = function match(pattern, val){
  utils.assertType(pattern, 'string', 'pattern');
  utils.assertString(val, 'val');
  var re = new RegExp(pattern.val);
  return new nodes.Boolean(re.test(val.string));
};

/**
 * Returns substring of the given `val`.
 *
 * @param {String|Ident} val
 * @param {Number} start
 * @param {Number} [length]
 * @return {String|Ident}
 * @api public
 */

exports.substr = function substr(val, start, length){
  utils.assertString(val, 'val');
  utils.assertType(start, 'unit', 'start');
  length = length && length.val;
  var res = val.string.substr(start.val, length);
  return val instanceof nodes.Ident
      ? new nodes.Ident(res)
      : new nodes.String(res);
};

/**
 * Returns string with all matches of `pattern` replaced by `replacement` in given `val`
 *
 * @param {String} pattern
 * @param {String} replacement
 * @param {String|Ident} val
 * @return {String|Ident}
 * @api public
 */

exports.replace = function replace(pattern, replacement, val){
  utils.assertString(pattern, 'pattern');
  utils.assertString(replacement, 'replacement');
  utils.assertString(val, 'val');
  pattern = new RegExp(pattern.string, 'g');
  var res = val.string.replace(pattern, replacement.string);
  return val instanceof nodes.Ident
    ? new nodes.Ident(res)
    : new nodes.String(res);
};

/**
 * Splits the given `val` by `delim`
 *
 * @param {String} delim
 * @param {String|Ident} val
 * @return {Expression}
 * @api public
 */
exports.split = function split(delim, val){
  utils.assertString(delim, 'delimiter');
  utils.assertString(val, 'val');
  var splitted = val.string.split(delim.string);
  var expr = new nodes.Expression();
  var ItemNode = val instanceof nodes.Ident
    ? nodes.Ident
    : nodes.String;
  for (var i = 0, len = splitted.length; i < len; ++i) {
    expr.nodes.push(new ItemNode(splitted[i]));
  }
  return expr;
};

/**
 * Return length of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Unit}
 * @api public
 */

(exports.length = function length(expr){
  if (expr) {
    if (expr.nodes) {
      var nodes = utils.unwrap(expr).nodes;
      if (1 == nodes.length && 'object' == nodes[0].nodeName) {
        return nodes[0].length;
      } else {
        return nodes.length;
      }
    } else {
      return 1;
    }
  }
  return 0;
}).raw = true;

/**
 * Inspect the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

(exports.p = function p(){
  [].slice.call(arguments).forEach(function(expr){
    expr = utils.unwrap(expr);
    if (!expr.nodes.length) return;
    console.log('\u001b[90minspect:\u001b[0m %s', expr.toString().replace(/^\(|\)$/g, ''));
  })
  return nodes.null;
}).raw = true;

/**
 * Throw an error with the given `msg`.
 *
 * @param {String} msg
 * @api public
 */

exports.error = function error(msg){
  utils.assertType(msg, 'string', 'msg');
  var err = new Error(msg.val);
  err.fromStylus = true;
  throw err;
};

/**
 * Warn with the given `msg` prefixed by "Warning: ".
 *
 * @param {String} msg
 * @api public
 */

exports.warn = function warn(msg){
  utils.assertType(msg, 'string', 'msg');
  console.warn('Warning: %s', msg.val);
  return nodes.null;
};

/**
 * Output stack trace.
 *
 * @api public
 */

exports.trace = function trace(){
  console.log(this.stack);
  return nodes.null;
};

/**
 * Push the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(exports.push = exports.append = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.push(utils.unwrap(arguments[i]).clone());
  }
  return expr.nodes.length;
}).raw = true;

/**
 * Pop a value from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

(exports.pop = function pop(expr) {
  expr = utils.unwrap(expr);
  return expr.nodes.pop();
}).raw = true;

/**
 * Unshift the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(exports.unshift = exports.prepend = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.unshift(utils.unwrap(arguments[i]));
  }
  return expr.nodes.length;
}).raw = true;

/**
 * Shift an element from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

 (exports.shift = function(expr){
   expr = utils.unwrap(expr);
   return expr.nodes.shift();
 }).raw = true;

/**
 * Return a `Literal` with the given `fmt`, and
 * variable number of arguments.
 *
 * @param {String} fmt
 * @param {Node} ...
 * @return {Literal}
 * @api public
 */

(exports.s = function s(fmt){
  fmt = utils.unwrap(fmt).nodes[0];
  utils.assertString(fmt);
  var self = this
    , str = fmt.string
    , args = arguments
    , i = 1;

  // format
  str = str.replace(/%(s|d)/g, function(_, specifier){
    var arg = args[i++] || nodes.null;
    switch (specifier) {
      case 's':
        return new Compiler(arg, self.options).compile();
      case 'd':
        arg = utils.unwrap(arg).first;
        if ('unit' != arg.nodeName) throw new Error('%d requires a unit');
        return arg.val;
    }
  });

  return new nodes.Literal(str);
}).raw = true;

/**
 * Return a `Literal` `num` converted to the provided `base`, padded to `width`
 * with zeroes (default width is 2)
 *
 * @param {Number} num
 * @param {Number} base
 * @param {Number} width
 * @return {Literal}
 * @api public
 */

(exports['base-convert'] = function(num, base, width) {
  utils.assertPresent(num, 'number');
  utils.assertPresent(base, 'base');
  num = utils.unwrap(num).nodes[0].val;
  base = utils.unwrap(base).nodes[0].val;
  width = (width && utils.unwrap(width).nodes[0].val) || 2;
  var result = Number(num).toString(base);
  while (result.length < width) {
    result = "0" + result;
  }
  return new nodes.Literal(result);
}).raw = true;

/**
 * Return the opposites of the given `positions`.
 *
 * Examples:
 *
 *    opposite-position(top left)
 *    // => bottom right
 *
 * @param {Expression} positions
 * @return {Expression}
 * @api public
 */

(exports['opposite-position'] = function oppositePosition(positions){
  var expr = [];
  utils.unwrap(positions).nodes.forEach(function(pos, i){
    utils.assertString(pos, 'position ' + i);
    pos = (function(){ switch (pos.string) {
      case 'top': return 'bottom';
      case 'bottom': return 'top';
      case 'left': return 'right';
      case 'right': return 'left';
      case 'center': return 'center';
      default: throw new Error('invalid position ' + pos);
    }})();
    expr.push(new nodes.Literal(pos));
  });
  return expr;
}).raw = true;

/**
 * Return the width and height of the given `img` path.
 *
 * Examples:
 *
 *    image-size('foo.png')
 *    // => 200px 100px
 *
 *    image-size('foo.png')[0]
 *    // => 200px
 *
 *    image-size('foo.png')[1]
 *    // => 100px
 *
 * Can be used to test if the image exists,
 * using an optional argument set to `true`
 * (without this argument this function throws error
 * if there is no such image).
 *
 * Example:
 *
 *    image-size('nosuchimage.png', true)[0]
 *    // => 0
 *
 * @param {String} img
 * @param {Boolean} ignoreErr
 * @return {Expression}
 * @api public
 */

exports['image-size'] = function imageSize(img, ignoreErr) {
  utils.assertType(img, 'string', 'img');
  try {
    var img = new Image(this, img.string);
  } catch (err) {
    if (ignoreErr) {
      return [new nodes.Unit(0), new nodes.Unit(0)];
    } else {
      throw err;
    }
  }

  // Read size
  img.open();
  var size = img.size();
  img.close();

  // Return (w h)
  var expr = [];
  expr.push(new nodes.Unit(size[0], 'px'));
  expr.push(new nodes.Unit(size[1], 'px'));

  return expr;
};

/**
 * Return the tangent of the given `angle`.
 *
 * @param {Unit} angle
 * @return {Unit}
 * @api public
 */
exports.tan = function tan(angle) {
  utils.assertType(angle, 'unit', 'angle');

  var radians = angle.val;

  if (angle.type === 'deg') {
    radians *= Math.PI / 180;
  }

  var m = Math.pow(10, 9);

  var sin = Math.round(Math.sin(radians) * m) / m
    , cos = Math.round(Math.cos(radians) * m) / m
    , tan = Math.round(m * sin / cos ) / m;

  return new nodes.Unit(tan, '');
}

/**
 * Apply Math `fn` to `n`.
 *
 * @param {Unit} n
 * @param {String} fn
 * @return {Unit}
 * @api private
 */

exports.math = function math(n, fn){
  utils.assertType(n, 'unit', 'n');
  utils.assertString(fn, 'fn');
  return new nodes.Unit(Math[fn.string](n.val), n.type);
};

/**
 * Get Math `prop`.
 *
 * @param {String} prop
 * @return {Unit}
 * @api private
 */

exports['-math-prop'] = function math(prop){
  return new nodes.Unit(Math[prop.string]);
};

/**
 * Adjust HSL `color` `prop` by `amount`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} prop
 * @param {Unit} amount
 * @return {RGBA}
 * @api private
 */

exports.adjust = function adjust(color, prop, amount){
  utils.assertColor(color, 'color');
  utils.assertString(prop, 'prop');
  utils.assertType(amount, 'unit', 'amount');
  var hsl = color.hsla.clone();
  prop = { hue: 'h', saturation: 's', lightness: 'l' }[prop.string];
  if (!prop) throw new Error('invalid adjustment property');
  var val = amount.val;
  if ('%' == amount.type){
    val = 'l' == prop && val > 0
      ? (100 - hsl[prop]) * val / 100
      : hsl[prop] * (val / 100);
  }
  hsl[prop] += val;
  return hsl.rgba;
};

/**
 * Return a clone of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

(exports.clone = function clone(expr){
  utils.assertPresent(expr, 'expr');
  return expr.clone();
}).raw = true;

/**
 * Add property `name` with the given `expr`
 * to the mixin-able block.
 *
 * @param {String|Ident|Literal} name
 * @param {Expression} expr
 * @return {Property}
 * @api public
 */

(exports['add-property'] = function addProperty(name, expr){
  utils.assertType(name, 'expression', 'name');
  name = utils.unwrap(name).first;
  utils.assertString(name, 'name');
  utils.assertType(expr, 'expression', 'expr');
  var prop = new nodes.Property([name], expr);
  var block = this.closestBlock;

  var len = block.nodes.length
    , head = block.nodes.slice(0, block.index)
    , tail = block.nodes.slice(block.index++, len);
  head.push(prop);
  block.nodes = head.concat(tail);
  
  return prop;
}).raw = true;

/**
 * Merge the object `dest` with the given args.
 *
 * @param {Object} dest
 * @param {Object} ...
 * @return {Object} dest
 * @api public
 */

(exports.merge = exports.extend = function merge(dest){
  utils.assertPresent(dest, 'dest');
  dest = utils.unwrap(dest).first;
  utils.assertType(dest, 'object', 'dest');

  var last = utils.unwrap(arguments[arguments.length - 1]).first
    , deep = (true === last.val);

  for (var i = 1, len = arguments.length - deep; i < len; ++i) {
    utils.merge(dest.vals, utils.unwrap(arguments[i]).first.vals, deep);
  }
  return dest;
}).raw = true;

/**
 * Remove the given `key` from the `object`.
 *
 * @param {Object} object
 * @param {String} key
 * @return {Object}
 * @api public
 */

exports.remove = function remove(object, key){
  utils.assertType(object, 'object', 'object');
  utils.assertString(key, 'key');
  delete object.vals[key.string];
  return object;
};

/**
 * Return the current selector or compile `sel` selector.
 *
 * @param {String} [sel]
 * @return {String}
 * @api public
 */

exports.selector = function selector(sel){
  var stack = this.selectorStack
    , group;
  if (sel && 'string' == sel.nodeName) {
    if (!~sel.val.indexOf('&') && '/' !== sel.val.charAt(0)) return sel.val;
    group = new nodes.Group;
    sel = new nodes.Selector([sel.val]);
    sel.val = sel.segments.join('');
    group.push(sel);
    stack.push(group.nodes);
  }
  return stack.length ? utils.compileSelectors(stack).join(',') : '&';
};

/**
 * Returns true if the given selector exists.
 *
 * @param {String} sel
 * @return {Boolean}
 * @api public
 */

exports['selector-exists'] = function selectorExists(sel) {
  utils.assertString(sel, 'selector');

  if (!this.__selectorsMap__) {
    var Normalizer = require('../visitor/normalizer')
      , visitor = new Normalizer(this.root.clone());
    visitor.visit(visitor.root);

    this.__selectorsMap__ = visitor.map;
  }

  return sel.string in this.__selectorsMap__;
};

/**
 * Prefix css classes in a block
 *
 * @param {String} prefix
 * @param {Block} block
 * @return {Block}
 * @api private
 */

exports['-prefix-classes'] = function prefixClasses(prefix, block){
  utils.assertString(prefix, 'prefix');
  utils.assertType(block, 'block', 'block');

  var _prefix = this.prefix;

  this.options.prefix = this.prefix = prefix.string;
  block = this.visit(block);
  this.options.prefix = this.prefix = _prefix;
  return block;
};

/**
 * Returns the @media string for the current block
 *
 * @return {String}
 * @api public
 */

exports['current-media'] = function currentMedia(){
  return new nodes.String(lookForMedia(this.closestBlock.node) || '');

  function lookForMedia(node){
    if ('media' == node.nodeName) {
      return node.toString();
    } else if (node.block.parent.node) {
      return lookForMedia(node.block.parent.node);
    }
  }
};

/**
 * Return the separator of the given `list`.
 *
 * Examples:
 *
 *    list1 = a b c
 *    list-separator(list1)
 *    // => ' '
 *
 *    list2 = a, b, c
 *    list-separator(list2)
 *    // => ','
 *
 * @param {Experssion} list
 * @return {String}
 * @api public
 */

(exports['list-separator'] = function listSeparator(list){
  list = utils.unwrap(list);
  return new nodes.String(list.isList ? ',' : ' ');
}).raw = true;

/**
 * Returns a list of units from `start` to `stop`
 * by `step`. If `step` argument is omitted,
 * it defaults to 1.
 *
 * @param {Unit} start
 * @param {Unit} stop
 * @param {Unit} [step]
 * @return {Expression}
 * @api public
 */

exports.range = function range(start, stop, step){
  utils.assertType(start, 'unit', 'start');
  utils.assertType(stop, 'unit', 'stop');
  if (step) {
    utils.assertType(step, 'unit', 'step');
    if (0 == step.val) {
      throw new Error('ArgumentError: "step" argument must not be zero');
    }
  } else {
    step = new nodes.Unit(1);
  }
  var list = new nodes.Expression;
  for (var i = start.val; i <= stop.val; i += step.val) {
    list.push(new nodes.Unit(i, start.type));
  }
  return list;
};

/**
 * Attempt to parse string.
 *
 * @param {String} str
 * @return {Node}
 * @api private
 */

function parseString(str){
  var Parser = require('../parser')
    , parser
    , ret;

  try {
    parser = new Parser(str);
    parser.state.push('expression');
    ret = new nodes.Expression();
    ret.nodes = parser.parse().nodes;
  } catch (e) {
    ret = new nodes.Literal(str);
  }
  return ret;
}

/**
 * Attempt to parse object node to the javascript object.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function parseObject(obj){
  obj = obj.vals;
  for (var key in obj) {
    var nodes = obj[key].nodes[0].nodes;
    if (nodes && nodes.length) {
      obj[key] = [];
      for (var i = 0, len = nodes.length; i < len; ++i) {
        obj[key].push(convert(nodes[i]));
      }
    } else {
      obj[key] = convert(obj[key].first);
    }
  }
  return obj;

  function convert(node){
    switch (node.nodeName) {
      case 'object':
        return parseObject(node);
      case 'boolean':
        return node.isTrue;
      case 'unit':
        return node.type ? node.toString() : +node.val;
      case 'string':
      case 'literal':
        return node.val;
      default:
        return node.toString();
    }
  }
}
