import nodes = require('../nodes');

/**
 * Returns the @media string for the current block
 *
 * @return {StringNode}
 * @api public
 */

export = function currentMedia(){
  var self = this;
  return new nodes.StringNode(lookForMedia(this.closestBlock.node) || '');

  function lookForMedia(node){
    if ('media' == node.nodeName) {
      node.val = self.visit(node.val);
      return node.toString();
    } else if (node.block.parent.node) {
      return lookForMedia(node.block.parent.node);
    }
  }
};
