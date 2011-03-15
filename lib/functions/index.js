
/*!
 * Stylus - Evaluator - built-in functions
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('../nodes')
  , utils = require('../utils')
  , Image = require('./image');

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
 * Color component type map.
 */

var typeMap = {
    hue: 'deg'
  , saturation: '%'
  , lightness: '%'
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
 * @param {RGBA|HSLA|Unit} h
 * @param {Unit} s
 * @param {Unit} l
 * @param {Unit} a
 * @return {HSLA}
 * @api public
 */

exports.hsla = function(h,s,l,a){
  switch (arguments.length) {
    case 1:
      utils.assertColor(h);
      return h.hsla;
    default:
      utils.assertType(h, nodes.Unit, 'hue');
      utils.assertType(s, nodes.Unit, 'saturation');
      utils.assertType(l, nodes.Unit, 'lightness');
      utils.assertType(a, nodes.Unit, 'alpha');
      return new nodes.HSLA(h.val,s.val,l.val,a.val);
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
 * @param {Unit|HSLA|RGBA} h
 * @param {Unit} s
 * @param {Unit} l
 * @return {HSLA}
 * @api public
 */

exports.hsl = function(h,s,l){
  if (arguments.length > 1) {
    return exports.hsla(h,s,l,new nodes.Unit(1));
  }
  utils.assertColor(h, 'color');
  return h.hsla;
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
exports['type-of'] = function(node){
  utils.assertPresent(node, 'expression');
  var type = node.nodeName;
  return new nodes.String(type);
};

/**
 * Return component `name` for the given `color`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} na,e
 * @return {Unit}
 * @api public
 */

exports.component = function(color, name) {
  utils.assertColor(color, 'color');
  utils.assertString(name, 'name');
  var name = name.string
    , type = typeMap[name]
    , name = componentMap[name];
  if (!name) throw new Error('invalid color component "' + name + '"');
  return new nodes.Unit(color[name], type);
};

/**
 * Return the red component of the given `color`.
 *
 * Examples:
 *
 *    red(#c00)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.red = function(color){
  return exports.component(color, new nodes.String('red'));
};

/**
 * Return the green component of the given `color`.
 *
 * Examples:
 *
 *    green(#0c0)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.green = function(color){
  return exports.component(color, new nodes.String('green'));
};

/**
 * Return the blue component of the given `color`.
 *
 * Examples:
 *
 *    blue(#00c)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.blue = function(color){
  return exports.component(color, new nodes.String('blue'));
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
 *    rgba(#ffcc00, 0.5)
 *    // rgba(255,204,0,0.5)
 *
 * @param {Unit|RGBA|HSLA} r
 * @param {Unit} g
 * @param {Unit} b
 * @param {Unit} a
 * @return {RGBA}
 * @api public
 */

exports.rgba = function(r,g,b,a){
  switch (arguments.length) {
    case 1:
      utils.assertColor(r);
      var color = r.rgba;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , color.a);
    case 2:
      utils.assertColor(r);
      var color = r.rgba;
      utils.assertType(g, nodes.Unit);
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , g.val);
    default:
      utils.assertType(r, nodes.Unit, 'red');
      utils.assertType(g, nodes.Unit, 'green');
      utils.assertType(b, nodes.Unit, 'blue');
      utils.assertType(a, nodes.Unit, 'alpha');
      return new nodes.RGBA(
          r.val
        , g.val
        , b.val
        , a.val);
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
 * @param {Unit|RGBA|HSLA} r
 * @param {Unit} g
 * @param {Unit} b
 * @return {RGBA}
 * @api public
 */

exports.rgb = function(r,g,b){
  switch (arguments.length) {
    case 1:
      utils.assertColor(r);
      var color = r.rgba;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , 1);
    default:
      return exports.rgba(r,g,b,new nodes.Unit(1));
  }
};

/**
 * Unquote the given `str`.
 *
 * Examples:
 *
 *    unquote("sans-serif")
 *    // => sans-serif
 *
 *    unquote(sans-serif)
 *    // => sans-serif
 *
 * @param {String|Ident} val
 * @return {Literal}
 * @api public
 */

exports.unquote = function(val){
  utils.assertString(val, 'string');
  return new nodes.Literal(val.string);
};

/**
 * Assign `type` to the given `unit` or return `unit`'s type.
 *
 * @param {Unit} unit
 * @param {String|Ident} type
 * @return {Unit}
 * @api public
 */

exports.unit = function(unit, type){
  utils.assertType(unit, nodes.Unit, 'unit');

  // Assign
  if (type) {
    utils.assertString(type, 'type');
    return new nodes.Unit(unit.val, type.string);
  } else {
    return new nodes.String(unit.type || '');
  }
};

/**
 * Lookup variable `name` or return Null.
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

exports.lookup = function(name){
  utils.assertType(name, nodes.String, 'name');
  var node = this.lookup(name.val);
  if (!node) return nodes.null;
  return this.visit(node);
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

exports.operate = function(op, left, right){
  utils.assertType(op, nodes.String, 'op');
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

exports.match = function(pattern, val){
  utils.assertType(pattern, nodes.String, 'pattern');
  utils.assertString(val, 'val');
  var re = new RegExp(pattern.val);
  return nodes.Boolean(re.test(val.string));
};

/**
 * Return length of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Unit}
 * @api public
 */

(exports.length = function(expr){
  if (expr) {
    if (expr.nodes) {
      return new nodes.Unit(utils.unwrap(expr).nodes.length);
    } else {
      return new nodes.Unit(1);
    }
  }
  return new nodes.Unit(0);
}).raw = true;

/**
 * Inspect the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

(exports.p = function(expr){
  expr = utils.unwrap(expr);
  console.log('\033[90minspect:\033[0m %s'
    , expr.toString().replace(/^\(|\)$/g, ''));
  return nodes.null;
}).raw = true;

/**
 * Throw an error with the given `msg`.
 *
 * @param {String} msg
 * @api public
 */

exports.error = function(msg){
  utils.assertType(msg, nodes.String, 'msg');
  throw new Error(msg.val);
};

/**
 * Warn with the given `msg` prefixed by "Warning: ".
 *
 * @param {String} msg
 * @api public
 */

exports.warn = function(msg){
  utils.assertType(msg, nodes.String, 'msg');
  console.warn('Warning: %s', msg.val);
  return nodes.null;
};

/**
 * Output stack trace.
 *
 * @api public
 */

exports.trace = function(){
  console.log(this.stack);
  return nodes.null;
};

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

(exports['opposite-position'] = function(positions){
  var expr = new nodes.Expression;
  utils.unwrap(positions).nodes.forEach(function(pos, i){
    utils.assertString(pos, 'position ' + i);
    pos = (function(){ switch (pos.string) {
      case 'top': return 'bottom';
      case 'bottom': return 'top';
      case 'left': return 'right';
      case 'right': return 'left';
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
 * @param {String} img
 * @return {Expression}
 * @api public
 */

exports['image-size'] = function(img) {
  utils.assertType(img, nodes.String, 'img');
  var img = new Image(this, img.string);

  // Read size
  img.open();
  var size = img.size();
  img.close();

  // Return (w h)
  var expr = new nodes.Expression;
  expr.push(new nodes.Unit(size[0], 'px'));
  expr.push(new nodes.Unit(size[1], 'px'));

  return expr;
};

/**
 * Apply Math `fn` to `n`
 *
 * @param {Unit} n
 * @param {String} fn
 * @return {Unit}
 * @api private
 */

exports['-math'] = function(n, fn){
  return new nodes.Unit(Math[fn.string](n.val), n.type);
};

/**
 * Adjust HSL `color` `prop` by `amount`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} prop
 * @param {Unit} amount
 * @return {HSLA}
 * @api private
 */

exports['-adjust'] = function(color, prop, amount){
  var hsl = color.hsla;
  prop = { hue: 'h', saturation: 's', lightness: 'l' }[prop.string];
  if (!prop) throw new Error('invalid adjustment property');
  hsl[prop] = hsl[prop] + amount.val;
  return hsl.clone();
};