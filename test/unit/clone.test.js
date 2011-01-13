
/**
 * Module dependencies.
 */

var nodes = require('../../lib/nodes')
  , should = require('should');

module.exports = {
  'test Color': function(){
    var node = new nodes.Color(255,50,0,1)
      , clone = node.clone();

    clone.should.not.equal(node);
    clone.r.should.equal(255);
    clone.g.should.equal(50);
    clone.b.should.equal(0);
    clone.a.should.equal(1);
  }
};