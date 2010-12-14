
/**
 * Module dependencies.
 */

var Parser = require('../lib/parser')
  , nodes = require('../lib/nodes')
  , should = require('should');

module.exports = {
  'test Node#toObject()': function(){
    var parser = new Parser('@fav-color: white')
      , ast = parser.parse();
    ast.toObject().should.eql([{ name: 'fav-color', val: [255,255,255,1] }]);
  },

  'test Node#toJSON()': function(){
    var parser = new Parser('@fav-color: white')
      , ast = parser.parse();
    ast.nodes[0].toJSON().should.equal('{"name":"fav-color","val":[255,255,255,1]}');
    ast.toJSON().should.equal('[' + ast.nodes[0].toJSON() + ']');
  }
};