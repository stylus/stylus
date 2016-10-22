/**
 * Get cache object by `name`.
 *
 * @param {String|Function} name
 * @param {Object} options
 * @return {Object}
 * @api private
 */

export = function getCache(name, options?){
  if ('function' == typeof name) return new name(options);

  var cache;
  switch (name){
    // case 'fs':
    //   cache = require('./fs')
    //   break;
    case 'memory':
      cache = require('./memory');
      break;
    default:
      cache = require('./null');
  }
  return new cache(options);
}
