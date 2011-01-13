
/**
 * Module dependencies.
 */

var nodes = require('../../lib/nodes')
  , should = require('should');

module.exports = {
  'test default': function(){
    nodes.null.clone().should.equal(nodes.null);
  },

  'test Color': function(){
    var node = new nodes.Color(255,50,0,1)
      , clone = node.clone();

    clone.should.not.equal(node);
    clone.r.should.equal(255);
    clone.g.should.equal(50);
    clone.b.should.equal(0);
    clone.a.should.equal(1);
  },
  
  'test HSLA': function(){
    var node = new nodes.HSLA(100, 50, 12, 1)
      , clone = node.clone();

    clone.should.not.equal(node);
    clone.h.should.equal(100);
    clone.s.should.equal(50);
    clone.l.should.equal(12);
    clone.a.should.equal(1);
  },
  
  'test String': function(){
    var node = new nodes.String('wahoo')
      , clone = node.clone();

    clone.should.not.equal(node);
    clone.val.should.equal('wahoo');
  },
  
  'test Expression': function(){
    var node = new nodes.Expression(true)
      , a = new nodes.Unit(15)
      , b = new nodes.Unit(20);

    node.push(a);
    node.push(b);

    var clone = node.clone();
    clone.should.not.equal(node);
    clone.nodes[0].should.not.equal(a);
    clone.nodes[1].should.not.equal(b);
    clone.nodes[0].val.should.equal(15);
    clone.nodes[1].val.should.equal(20);
  },
  
  'test Params': function(){
    var node = new nodes.Params
      , a = new nodes.Unit(15)
      , b = new nodes.Unit(20);

    node.push(a);
    node.push(b);

    var clone = node.clone();
    clone.should.not.equal(node);
    clone.nodes[0].should.not.equal(a);
    clone.nodes[1].should.not.equal(b);
    clone.nodes[0].val.should.equal(15);
    clone.nodes[1].val.should.equal(20);
  }
};