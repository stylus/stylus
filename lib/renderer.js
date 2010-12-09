
/*!
 * CSS - Renderer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

var Renderer = module.exports = function Renderer(str, options) {
  options = options || {};
  this.str = str;
  this.filename = options.filename || 'css';
};

Renderer.prototype.render = function(fn){
  
};
