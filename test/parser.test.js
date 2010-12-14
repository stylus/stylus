
/**
 * Module dependencies.
 */

var Parser = require('../lib/parser')
  , nodes = require('../lib/nodes')
  , should = require('should');

module.exports = {
  'test variable': function(){
    var parser = new Parser('@foo')
      , ast = parser.parse();
    
    ast.should.be.an.instanceof(nodes.Block);
    ast.nodes[0].should.be.an.instanceof(nodes.Variable);
    ast.nodes[0].should.have.property('name', 'foo');
    ast.nodes[0].should.not.have.property('val');
  },
  
  'test variable assignment': function(){
    var parser = new Parser('@light-color: #fff')
      , ast = parser.parse();
    
    ast.should.be.an.instanceof(nodes.Block);
    ast.nodes[0].should.be.an.instanceof(nodes.Variable);
    ast.nodes[0].should.have.property('name', 'light-color');
    ast.nodes[0].val.should.be.an.instanceof(nodes.Color);
  }
};