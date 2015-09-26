var nodes = require('../nodes');

/**
 * Returns the @media string for the current block
 *
 * @return {String}
 * @api public
 */

module.exports = function currentMedia(){
  return new nodes.String(lookForMedia(this.closestBlock.node) || '');

  function lookForMedia(node){
    if ('media' == node.nodeName) {
      return node.toString();
    } else if (node.block.parent.node) {
      return lookForMedia(node.block.parent.node);
    }
  }
};
