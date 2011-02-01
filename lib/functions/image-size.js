

/*!
 * CSS - plugin - url
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils')
  , nodes = require('../nodes')
  , fs = require('fs');

function Image(path) {
  this.path = path;
}

Image.prototype.open = function(){
  this.fd = fs.openSync(this.path, 'r');
};

Image.prototype.close = function(){
  if (this.fd) fs.closeSync(this.fd);
};

Image.prototype.type = function(){
  var type
    , chunk = fs.readSync(this.fd, 10, 0)[0];

  // GIF
  if ('GIF' == chunk.slice(0, 3)) type = 'gif';

  // PNG
  if ('PNG' == chunk.slice(1, 4)) type = 'png';

  // JPEG
  if ('JFIF' == chunk.slice(6, 10)) type = 'jpeg';

  return type;
};

Image.prototype.size = function(){
  var width
    , height
    , type = this.type();

  // Determine dimensions
  switch (type) {
    case 'jpeg':
      throw new Error('jpeg not yet supported');
      break;
    case 'png':
      var buf = new Buffer(8);
      // IHDR chunk width / height uint32_t big-endian
      fs.readSync(this.fd, buf, 0, 8, 16);
      var w = buf.slice(0, 4);
      var h = buf.slice(4, 8);
      width = w[0] << 24 | w[1] << 16 | w[2] << 8 | w[3];
      height = h[0] << 24 | h[1] << 16 | h[2] << 8 | h[3];
      break;
    case 'gif':
      var buf = new Buffer(4);
      // width / height uint16_t native-endian
      fs.readSync(this.fd, buf, 0, 4, 6);
      width = buf[1] << 8 | buf[0];
      height = buf[3] << 8 | buf[2];
      break;
  }

  if ('number' != typeof width) throw new Error('failed to find image width');
  if ('number' != typeof height) throw new Error('failed to find image height');

  return [width, height];
};

module.exports = function(img) {
  utils.assertType(img, nodes.String, 'img');
  var img = new Image(__dirname + '/' + img.string);
  img.open();
  var size = img.size();
  img.close();

  // Return (w h)
  var expr = new nodes.Expression;
  expr.push(new nodes.Unit(size[0], 'px'));
  expr.push(new nodes.Unit(size[1], 'px'));

  return expr;
};