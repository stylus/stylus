/**
 * Get cache object by `name`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {Object}
 * @api private
 */

var getCache = module.exports = function(name, options){
  var cache;
  switch (name){
    case 'fs':
      cache = require('./fs')
      break;
    case 'memory':
      cache = require('./memory');
      break;
    default:
      cache = require('./null');
  }
  return new cache(options);
};
