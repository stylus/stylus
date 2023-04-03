
/*!
 * Stylus - units
 * Copyright (c) Automattic <developer.wordpress.com>
 * MIT Licensed
 */

// units found in http://www.w3.org/TR/css3-values
// and in https://www.w3.org/TR/css-values-4

module.exports = [
    'em', 'ex', 'ch', 'rem' // relative lengths

  , 'vw', 'svw', 'lvw', 'dvw' // relative viewport-percentage lengths (including de-facto standard)
  , 'vh', 'svh', 'lvh', 'dvh'
  , 'vi', 'svi', 'lvi', 'dvi'
  , 'vb', 'svb', 'lvb', 'dvb'
  , 'vmin', 'svmin', 'lvmin', 'dvmin'
  , 'vmax', 'svmax', 'lvmax', 'dvmax'

  , 'cm', 'mm', 'in', 'pt', 'pc', 'px' // absolute lengths
  , 'deg', 'grad', 'rad', 'turn' // angles
  , 's', 'ms' // times
  , 'Hz', 'kHz' // frequencies
  , 'dpi', 'dpcm', 'dppx', 'x' // resolutions
  , '%' // percentage type
  , 'fr' // grid-layout (http://www.w3.org/TR/css3-grid-layout/)
];
