
/**
 * Module dependencies.
 */

var Evaluator = require('../../lib/visitor/evaluator')
  , nodes = require('../../lib/nodes')
  , should = require('should');

var eval = new Evaluator(new nodes.Root);

module.exports = {
  'test visitNull()': function(){
    var node = new nodes.Null;
    eval.visitNull(node).should.equal(node);
  },
  
  'test visitVariable()': function(){
    var node = new nodes.Variable('size', new nodes.Unit(12, 'px'));

    // Define
    eval.visitVariable(node).should.be.an.instanceof(nodes.Null);

    // Lookup
    eval.lookup = true;
    var ret = eval.visitVariable(node);
    ret.val.should.equal(12);

    // Undefined
    try {
      eval.visitVariable(new nodes.Variable('foo'));
      throw new Error('undefined variable did not throw');
    } catch (err) {
      err.message.should.equal('undefined variable @foo');
    }
    eval.lookup = false;
    
  },
  
  'test visitBinOp()' : function(){
    var add = new nodes.BinOp('+', new nodes.Unit(15), new nodes.Unit(15));
    var ret = eval.visitBinOp(add);
    ret.should.be.an.instanceof(nodes.Unit);
    ret.val.should.equal(30);
    
    add = new nodes.BinOp('-', add, new nodes.Unit(20));
    ret = eval.visitBinOp(add);
    ret.should.be.an.instanceof(nodes.Unit);
    ret.val.should.equal(10);

    var invalid = new nodes.BinOp('+', new nodes.Keyword('auto'), new nodes.Keyword('foo'));
    try {
      eval.visitBinOp(invalid);
      throw new Error('did not throw on invalid operand');
    } catch (err) {
      err.message.should.equal('cannot operate on keyword');
    }
    
    var str = new nodes.BinOp('+', new nodes.String('foo'), new nodes.String('bar'));
    ret = eval.visitBinOp(str);
    ret.val.should.equal('foobar');

    try {
      str.op = '-';
      eval.visitBinOp(str);
      throw new Error('did not throw on invalid operation');
    } catch (err) {
      err.message.should.equal('invalid operation - on string');
    }
  },
  
  'test visitProperty()': function(){
    var prop = new nodes.Property('background');
    prop.expr = new nodes.Expression;
    prop.expr.push(new nodes.Color(255,0,0,1));
    
    var ret = eval.visitProperty(prop);
    ret.name.should.equal('background');
    ret.expr.nodes.should.have.length(1);
    ret.expr.nodes[0].r.should.equal(255);

    var node = new nodes.Variable('size', new nodes.Unit(12, 'px'));

    // Define
    eval.visitVariable(node).should.be.an.instanceof(nodes.Null);
    prop = new nodes.Property('font');
    prop.expr = new nodes.Expression;
    prop.expr.push(new nodes.Variable('size'));
    ret = eval.visitProperty(prop);
    ret.name.should.equal('font');
    ret.expr.nodes[0].val.should.equal(12);
  },
  
  'test visitCall()': function(){
    // add(a, b)
    //   a + b
    var params = new nodes.Params;
    params.push(new nodes.Variable('a'));
    params.push(new nodes.Variable('b'));
    var body = new nodes.Block;
    body.push(new nodes.BinOp('+', new nodes.Variable('a'), new nodes.Variable('b')));
    var add = new nodes.Function('add', params, body);
    eval.visitVariable(new nodes.Variable('add', add));

    var args = new nodes.Expression;
    args.push(new nodes.Unit(10));
    args.push(new nodes.Unit(5));
    var call = new nodes.Call('add', args);

    // return value
    eval.isProperty = true;
    var ret = eval.visitCall(call);
    ret.val.should.equal(15);

    // Mixin
    eval.isProperty = false;
    var ret = eval.visitCall(call);
    ret.should.be.an.instanceof(nodes.Null);
    var block = eval.stack.currentFrame.block;
    block.nodes[0].val.should.equal(15);
  }
};