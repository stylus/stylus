var utils = require('../utils')
  , nodes = require('../nodes');

/**
 * Return the current selector or compile `sel` selector.
 *
 * @param {String} [sel]
 * @return {String}
 * @api public
 */

module.exports = function selector(sel){
  var stack = this.selectorStack;

  if (sel && 'string' == sel.nodeName) {
    var Parser = require('../selector-parser')
      , parsed = new Parser(sel.val).parse().val
      , group;

    if (parsed == sel.val) return sel.val;

    group = new nodes.Group;
    sel = new nodes.Selector([sel.val]);
    sel.val = sel.segments.join('');
    group.push(sel);
    stack.push(group.nodes);
  }
  return stack.length ? utils.compileSelectors(stack).join(',') : '&';
};
