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
  var stack = this.selectorStack
    , group;
  if (sel && 'string' == sel.nodeName) {
    if (!~sel.val.indexOf('&') && '/' !== sel.val.charAt(0)) return sel.val;
    group = new nodes.Group;
    sel = new nodes.Selector([sel.val]);
    sel.val = sel.segments.join('');
    group.push(sel);
    stack.push(group.nodes);
  }
  return stack.length ? utils.compileSelectors(stack).join(',') : '&';
};
