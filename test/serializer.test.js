
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
    ast.toObject().should.eql([{
        type: 'variable'
      , name: 'fav-color'
      , val: [
        { type: 'color' , val: [255,255,255,1] }
      ]
    }]);
  },

  'test Node#toJSON()': function(){
    var parser = new Parser('@size: 12px')
      , ast = parser.parse();
    ast.nodes[0].toJSON().should.include.string('{"type":"variable","name":"size","val');
  }
};