
/*!
 * Stylus - CIELAB
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 *              2011 Kevin Bortis <wermut@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , HSLA = require('./hsla')
  , RGBA = require('./rgba')
  , nodes = require('./');

/**
 * Initialize a new `CIELAB+alpha` with the given L*,a*,b*,alpha component values.
 *
 * @param {Number} L
 * @param {Number} a
 * @param {Number} b
 * @param {Number} alpha
 * @api public
 */

var CIELAB = exports = module.exports = function CIELAB(L,a,b,alpha){
  Node.call(this);
  this.L = clamp(L, 'L');
  this.a = clamp(a);
  this.b = clamp(b);
  this.alpha = clamp(alpha, 'alpha');
  this.cielab = this;
};

/**
 * Inherit from `Node.prototype`.
 */

CIELAB.prototype.__proto__ = Node.prototype;

/**
 * Return an `CIELAB+alpha` without clamping values.
 * 
 * @param {Number} L
 * @param {Number} a
 * @param {Number} b
 * @param {Number} alpha
 * @return {CIELAB}
 * @api public
 */

CIELAB.withoutClamping = function(L,a,b,alpha){
  var cielab = new CIELAB(0,0,0,0);
  cielab.L = L;
  cielab.a = a;
  cielab.b = b;
  cielab.alpha = alpha;
  return cielab;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

CIELAB.prototype.clone = function(){
  var clone = new CIELAB(
      this.L
    , this.a
    , this.b
    , this.alpha);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return true.
 *
 * @return {Boolean}
 * @api public
 */

CIELAB.prototype.toBoolean = function(){
  return nodes.true;
};

/**
 * Return `HSLA` representation.
 *
 * @return {HSLA}
 * @api public
 */

CIELAB.prototype.__defineGetter__('hsla', function(){
  // This function has to be rewritten
  // Will eventually lose some color info
  return new HSLA.fromRGBA(cielab_to_rgba(this));
});

/**
 * Return `RGBA` representation.
 *
 * @return {RGBA}
 * @api public
 */

 CIELAB.prototype.__defineGetter__('rgba', function(){
   return cielab_to_rgba(this);
 });

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

CIELAB.prototype.__defineGetter__('hash', function(){
  return this.toString();
});

/**
 * Adjust L,a,b,alpha according to the supplied values.
 *
 * @param {Number} L
 * @param {Number} a
 * @param {Number} b
 * @param {Number} alpha
 * @return {CIELAB} new node
 * @api public
 */

CIELAB.prototype.lab_adjust = function(L,a,b,alpha){
  return new CIELAB(
      this.L + L
    , this.a + a
    , this.b + b
    , this.alpha + alpha);
};

/**
 * Adjust `H,L,C,alpha` according to the supplied values.
 *
 * @param {Number} H
 * @param {Number} L
 * @param {Number} C
 * @param {Number} alpha
 * @return {CIELAB} new node
 * @api public
 */

 CIELAB.prototype.hlc_adjust = function(H,L,C,alpha) {
  var hlc = cielab_to_hlc(this);

  H = hlc[0] + H;
  L = hlc[1] + L;
  C = hlc[2] + C;
  alpha = hlc[3] + alpha;

  return hlc_to_cielab(H,L,C,alpha);
 };

/**
 * Returns an Array of CIELAB objects in a monochrome row.
 *
 * @param {Number} n
 * @param {Number} hue
 * @return {Array} of new nodes
 * @api public
 */

CIELAB.prototype.monochrome = function(n, lightness, mode) {
  var hlc = cielab_to_hlc(this);

  // Default darken
  mode = (mode == 'lighten') ? 1 : -1;

  var mono = [this];
  for (var c=1; n>c; c++) {

    mono.push(hlc_to_cielab(
        hlc[0]
      , hlc[1] + c * lightness * mode
      , hlc[2]
      , hlc[3]
    ));
  };

  return mono;
};

/**
 * Returns complement colors for CIELAB node.
 *
 * @param {number} n
 * @return {Array} of new nodes
 * @api public
 */

CIELAB.prototype.complement = function(n) {
  var step = 360 / n
    , hlc = cielab_to_hlc(this);

  var comp = [this];
  var h;
  for (var c=1; n>c; c++) {
    h = hlc[0] + c * step;
    h = (h >= 360) ? h-360 : h;
    h = (h < 0) ? h+360 : h;

    comp.push(hlc_to_cielab(
        h
      , hlc[1]
      , hlc[2]
      , hlc[3]
    ));
  };

    return comp;
};

/**
 * Returns gradient CIELAB colors.
 *
 * @param {number} n
 * @param {CIELAB} cielab
 * @param {String} mode
 * @return {Array} of new nodes
 * @api public
 */

CIELAB.prototype.gradient = function(n, cielab, mode) {
  var hlc_start = cielab_to_hlc(this)
    , hlc_end = cielab_to_hlc(cielab)
    , l_step = Math.abs(hlc_start[1] - hlc_end[1]) / n
    , c_step = Math.abs(hlc_start[2] - hlc_end[2]) / n
    , w = hlc_start[0] - hlc_end[0]
    , w1 = abs(w)
    , w2 = 360 - w1;

  // Does not work if both colors are the same
  if( w == 0) {
    return [];
  };

  // First color is `this`
  var grad = [this];

  // Get Lightness direction
  var ldir = (hlc_start[1] > hlc_end[1]) ? -1 : 1;

  // Get Chroma direction
  var cdir = (hlc_start[2] > hlc_end[2]) ? -1 : 1;

  // Get Hue direction
  var hdir = w / w1;

  // Calculate steps
  step = min(w1, w2) / n;
  long_step = max(w1, w2) / n;

  // Switching mode?
  if( mode == 'long') {
    hdir = hdir * -1;
    step = long_step;
  };

  for(n ; n>2; n--) {
    // Calculating Hue
    h = hlc_start[0] + ( hdir * step );
    h = (h >= 360) ? h-360 : h;
    h = (h < 0) ? h+360 : h;

    // Calculating Lightness
    l = hlc_start[1] + (ldir * l_step);
    hlc_start[1] = l;

    // Calculating Chroma
    c = hlc_start[2] + (cdir * c_step);
    hlc_start[2] = c;

    grad.push(hlc_to_cielab(
        h
      , l
      , c
      , this.alpha
    ));
  };

  return grad;
};

/**
 * Return #nnnnnn, #nnn, or rgba(n,n,n,n) RGBA string 
 * representation of the CIELAB color.
 *
 * @return {String}
 * @api public
 */

CIELAB.prototype.toString = function(){
  // Giving back CIELAB makes no sense at the moment.
  // Since HSL and RGB are profile dependend it makes
  // no difference.
  var rgba = new RGBA(cielab_to_rgba(this));

  function pad(n) {
    return n < 16
      ? '0' + n.toString(16)
      : n.toString(16);
  }

  if (1 == rgba.a) {
    var r = pad(rgba.r)
      , g = pad(rgba.g)
      , b = pad(rgba.b);

    // Compress
    if (r[0] == r[1] && g[0] == g[1] && b[0] == b[1]) {
      return '#' + r[0] + g[0] + b[0];
    } else {
      return '#' + r + g + b;
    }
  } else {
    return 'rgba('
      + this.r + ','
      + this.g + ','
      + this.b + ','
      + this.a.toFixed(2) + ')';
  }
};

/**
 * Return a `CIELAB` from the given `H,L,C`.
 *
 * @param {Number} H
 * @param {Number} L
 * @param {Number} C
 * @return {CIELAB} new node
 * @api public
 */

exports.CIEHLC = function(H,L,C,alpha){
  return hlc_to_cielab(H,L,C,alpha);
};

/**
 * Return a `CIELAB` from the given `L,C,H`.
 *
 * @param {Number} L
 * @param {Number} C
 * @param {Number} H
 * @return {CIELAB} new node
 * @api public
 */

exports.CIELCH = function(L,C,H,alpha){
  return hlc_to_cielab(H,L,C,alpha);
};

/**
 * Return a `CIELAB` from the given `rgba`.
 *
 * @param {RGBA} rgba
 * @return {CIELAB} new node
 * @api public
 */

exports.fromRGBA = function(rgba){
  var R = rgba.r / 255
    , G = rgba.g / 255
    , B = rgba.b / 255
    , alpha = rgba.a;

  R = convRGB(R) * 100;
  G = convRGB(G) * 100;
  B = convRGB(B) * 100;

  // Adjust Observer and Illuminant
  X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 95.047
  Y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 100
  Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 108.883

  // Step 2: Convert XYZ to CIE-L*a*b*
  X = convXYZ(X);
  Y = convXYZ(Y);
  Z = convXYZ(Z);

  var L = ( 116 * Y ) - 16
    , a = 500 * ( X - Y )
    , b = 200 * ( Y - Z );

  // Helper functions
  function convRGB(c) {
    var res = (c > 0.04045) ? Math.pow(((c + 0.055 ) / 1.055),2.4) : c / 12.92;
    return res;
  };

  function convXYZ(c) {
    var res = (c > 0.008856) ? Math.pow(c, 1/3) : ( 7.787 * c ) + ( 16 / 116 );
    return res;
  };

  return new CIELAB(L,a,b,alpha);
};


/**
 * Converts a CIEHLC+alpha to CIELAB
 *
 * @param {Number} H
 * @param {Number} L
 * @param {Number} C
 * @param {Number} alpha
 * @return {CIELAB} new node
 * @api private
 */

function hlc_to_cielab(H,L,C,alpha) {
  // Convert the radian HLC Value to the cartesian L*a*b
  var a = Math.cos(H/180*Math.PI) * C
    , b = Math.sin(H/180*Math.PI) * C;

  return new CIELAB(L,a,b,alpha);
};

/**
 * Converts a CIELAB color to RGBA
 *
 * @param {CIELAB} cielab
 * @return {RGBA} new node
 * @api private
 */

function cielab_to_rgba(cielab) {
  // Prepare Components
  var Y = ( cielab.L + 16 ) / 116
    , X = cielab.a / 500 + Y
    , Z = Y - cielab.b / 200;

  // Convert to CIE XYZ
  X = convXYZ(X);
  Y = convXYZ(Y);
  Z = convXYZ(Z);

  // Normalize to monitor, observer and illuminant
  X = 95.047 * X / 100;
  //Y = 100.000 * Y / 100;
  Z = 108.883 * Z / 100;

  // Step 2: Convert calculated XYZ values to RGB
  var r = convRGB(X * 3.2406 + Y * -1.5372 + Z * -0.4986)
    , g = convRGB(X * -0.9689 + Y * 1.8758 + Z * 0.0415)
    , b = convRGB(X * 0.0557 + Y * -0.2040 + Z * 1.0570)
    , a = 1;

  // Helper functions
  function convXYZ(c) {
    var c3 = Math.pow(c,3);
    var res = (c3 > 0.008856) ? c3 : ( c - 16 / 116 ) / 7.787;
    return res;
  };

  function convRGB(c) {
    var c2 = Math.pow(c, 1/2.4)
    var res = (c > 0.0031308) ? 1.055 * c2 - 0.055 : 12.92 * c;
    res = Math.round(res * 255);
    return res;
  };

  // Return new RGBA object to caller
  return new RGBA(r,g,b,a);
};

/**
 * Returns `H,C,L` from `CIELAB`
 *
 * @param {CIELAB}
 * @return {Array}
 * @api private
 */

function cielab_to_hcl(cielab) {
  var H = Math.arctan(cielab.b/cielab.a)
    , L = cielab.L
    , C = Math.sqrt( Math.pow(cielab.a, 2) + Math.pow(cielab.b, 2))
    , alpha = cielab.alpha;

  H = (H > 0) ? H / Math.PI * 180 : 360 - Math.abs(H) / Math.PI * 180;

  return [H,C,L,alpha];
};

/**
 * Clamp `n` according to type.
 * Default range -127 to 128
 *
 * @param {Number} n
 * @param {String} type
 * @return {Number}
 * @api private
 */

function clamp(n, type) {
  var min
    , max;
  switch( type) {
    case 'L':
      min = 0;
      max = 100;
    case 'alpha':
      min = 0;
      max = 1;
    defaul:
      min -127;
      max 128;

  return Math.max(min, Math.min(n, max));
};

