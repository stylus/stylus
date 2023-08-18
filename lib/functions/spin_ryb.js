var nodes = require('../nodes')
  , hsla = require('./hsla');

/**
 * Rotate a color on the RGB color wheel using the RYB color model.
 *
 * Example:
 * 
 *    spin_ryb(#f00, 180)
 *    // => #0f0
 * 
 * @param {RGBA|HSLA} color - The color to rotate.
 * @param {Expression} amount - The angle in degrees to rotate the color.
 * @return {RGBA} - The rotated color.
 * @api public
 */
var spin_ryb = function(color, amount) {
  var hslaColor = color.hsla;
  var h = hslaColor.h;

  if (amount instanceof nodes.Unit) {
    // Extract the numeric value and unit from amount
    var value = amount.val;
    var unit = amount.type;

    if (unit === 'deg') {
      // Angle is already in degrees
      amount = value;
    } else if (unit === 'rad') {
      // Convert radians to degrees
      amount = value * (180 / Math.PI);
    }
  }

  amount = amount % 360;

  var wheel = [
    [0, 0],
    [15, 8],
    [30, 16],
    [45, 24],
    [60, 31],
    [75, 37],
    [90, 42],
    [105, 41],
    [120, 52],
    [135, 70],
    [150, 92],
    [165, 111],
    [180, 120],
    [195, 144],
    [210, 161],
    [225, 178],
    [240, 204],
    [255, 212],
    [270, 228],
    [285, 245],
    [300, 264],
    [315, 279],
    [330, 296],
    [345, 328],
    [360, 0]
  ];

  // Find the closest hue in the wheel
  var closest = null;
  var minDiff = Number.MAX_SAFE_INTEGER;
  var index;

  for (var i = 0; i < wheel.length; i++) {
    var entry = wheel[i];
    var diff = Math.abs(h - entry[0]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
      index = i;
    }
  }

  var x0 = closest[0];
  var y0 = closest[1];
  var x1 = wheel[(index + 1) % wheel.length][0];
  var y1 = wheel[(index + 1) % wheel.length][1];

  if (y1 < y0) {
    y1 += 360;
  }

  var a = x0 + ((x1 - x0) * (h - y0)) / (y1 - y0);
  a = (a + amount) % 360;

  // Find the closest hue in the wheel again
  closest = null;
  minDiff = Number.MAX_SAFE_INTEGER;

  for (var j = 0; j < wheel.length; j++) {
    var entry = wheel[j];
    var diff = Math.abs(a - entry[0]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
      index = j;
    }
  }

  x0 = closest[0];
  y0 = closest[1];
  x1 = wheel[(index + 1) % wheel.length][0];
  y1 = wheel[(index + 1) % wheel.length][1];

  if (y1 < y0) {
    y1 += 360;
  }

  var newHue;
  if (x1 === x0) {
    newHue = y0;
  } else {
    newHue = y0 + ((y1 - y0) * (a - x0)) / (x1 - x0);
  }

  newHue = newHue % 360;

  return hsla(
    new nodes.Unit(newHue),
    new nodes.Unit(hslaColor.s),
    new nodes.Unit(hslaColor.l),
    new nodes.Unit(hslaColor.a)
  );
};
spin_ryb.params = ['color', 'amount'];
module.exports = spin_ryb;
