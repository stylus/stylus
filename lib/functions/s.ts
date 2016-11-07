import utils = require('../utils');
import nodes = require('../nodes');
import Compiler = require('../visitor/compiler');

/**
 * Return a `Literal` with the given `fmt`, and
 * variable number of arguments.
 *
 * @param {String} fmt
 * @param {Node} ...
 * @return {Literal}
 * @api public
 */

export = class s{
  options;
  constructor(fmt){
  fmt = utils.unwrap(fmt).nodes[0];
  utils.assertString(fmt);
  var str = fmt.string
    , args = arguments
    , i = 1;

  // format
  str = str.replace(/%(s|d)/g, (_, specifier) => {
    var arg = args[i++] || nodes.nullNode;
    switch (specifier) {
      case 's':
        return new Compiler(arg, this.options).compile();
      case 'd':
        arg = utils.unwrap(arg).first;
        if ('unit' != arg.nodeName) throw new Error('%d requires a unit');
        return arg.val;
    }
  });

  return new nodes.Literal(str);
}

  static raw = true;
}
