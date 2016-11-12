/**
 * Get cache object by `name`.
 *
 * @param {StringNode|Function} name
 * @param {ObjectNode} options
 * @return {ObjectNode}
 * @api private
 */

import {MemoryCache} from './memory';
import {NullCache} from './null';

export function getCache(name, options?){
  if ('function' == typeof name) return new name(options);

  var cache;
  switch (name){
    // case 'fs':
    //   cache = require('./fs')
    //   break;
    case 'memory':
      cache = MemoryCache;
      break;
    default:
      cache = NullCache;
  }
  return new cache(options);
}
