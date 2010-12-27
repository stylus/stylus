
/**
 * Module dependencies.
 */

var Compiler = require('../../lib/visitor/compiler')
  , nodes = require('../../lib/nodes')
  , should = require('should');

var compiler = new Compiler;

module.exports = {
  'test visitNull()': function(){
    compiler.visitNull(nodes.null).should.equal('');
  },
  
  'test visitCall()': function(){
    var args = new nodes.Expression;
    args.push(new nodes.Unit(12, 'px'));
    var call = new nodes.Call('foo', args);
    compiler.visitCall(call).should.equal('foo(12px)');
  },
  
  'test visitColor()': function(){
    var color = new nodes.Color(0,255,0,1);
    compiler.visitColor(color).should.equal('#00ff00');
    
    var color = new nodes.Color(5,255,30,1);
    compiler.visitColor(color).should.equal('#05ff1e');
    
    var color = new nodes.Color(0,80,0,0.5);
    compiler.visitColor(color).should.equal('rgba(0,80,0,0.5)');

    compiler.compress = true;
    var color = new nodes.Color(255,0,0,1);
    compiler.visitColor(color).should.equal('#f00');
    
    var color = new nodes.Color(255,5,0,1);
    compiler.visitColor(color).should.equal('#f00');

    var color = new nodes.Color(5,255,30,1);
    compiler.visitColor(color).should.equal('#05ff1e');
    
    compiler.compress = false;
  },
  
  'test visitProperty()': function(){
    var prop = new nodes.Property('background');
    prop.expr = new nodes.Expression;
    prop.expr.push(new nodes.Color(255,255,0,1));
    compiler.visitProperty(prop).should.equal('background: #ffff00;');
  
    prop.expr.push(new nodes.Color(0,0,0,1));
    compiler.visitProperty(prop).should.equal('background: #ffff00 #000000;');
    
    compiler.compress = true;
    compiler.visitProperty(prop).should.equal('background:#ffff00 #000000;');
    compiler.compress = false;
  },
  
  'test visitString()': function(){
    compiler.visitString(new nodes.String('testing')).should.equal('"testing"');
  },
  
  'test visitIdent()': function(){
    compiler.visitIdent(new nodes.Ident('auto')).should.equal('auto');
  },
  
  'test visitVariable()': function(){
    compiler.visitVariable(new nodes.Variable('foo')).should.equal('');
  },
  
  'test visitUnit()': function(){
    compiler.visitUnit(new nodes.Unit(12)).should.equal('12');
    compiler.visitUnit(new nodes.Unit(15.99)).should.equal('15.99');
    compiler.visitUnit(new nodes.Unit(0.5)).should.equal('0.5');
    compiler.visitUnit(new nodes.Unit(5, 'px')).should.equal('5px');
    compiler.visitUnit(new nodes.Unit(5.99, 'px')).should.equal('6px');
    compiler.visitUnit(new nodes.Unit(10, '%')).should.equal('10%');
    compiler.compress = true;
    compiler.visitUnit(new nodes.Unit(0.5)).should.equal('.5');
    compiler.visitUnit(new nodes.Unit(0, '%')).should.equal('0');
    compiler.visitUnit(new nodes.Unit(0, 'px')).should.equal('0');
    compiler.compress = false;
  },
  
  'test visitExpression()': function(){
    var expr = new nodes.Expression;
    expr.push(new nodes.Unit(1));
    expr.push(new nodes.Unit(2));
    expr.push(new nodes.Unit(3));
    
    compiler.visitExpression(expr).should.equal('1 2 3');
    expr.isList = true;
    compiler.visitExpression(expr).should.equal('1, 2, 3');
    compiler.compress = true;
    compiler.visitExpression(expr).should.equal('1,2,3');
    compiler.compress = false;
  },
  
  'test visitBlock()': function(){
    var block = new nodes.Block
      , prop = new nodes.Property('color');
    prop.expr = new nodes.Expression;
    prop.expr.push(new nodes.Color(255,0,0,1));
    block.push(prop);
    block.push(nodes.null);
    block.push(nodes.null);
    block.push(nodes.null);
    block.push(prop);
    
    compiler.visitBlock(block).should.equal(' {\n  color: #ff0000;\n  color: #ff0000;\n}');
    compiler.compress = true;
    compiler.visitBlock(block).should.equal('{color:#ff0000;color:#ff0000;}');
    compiler.compress = false;
  },
  
  'test visitRoot()': function(){
    var block = new nodes.Root
      , prop = new nodes.Property('color');
    prop.expr = new nodes.Expression;
    prop.expr.push(new nodes.Color(255,0,0,1));
    block.push(prop);
    block.push(nodes.null);
    block.push(nodes.null);
    block.push(nodes.null);
    block.push(new nodes.Expression);
    block.push(prop);
    
    compiler.visitRoot(block).should.equal('color: #ff0000;\ncolor: #ff0000;');
    compiler.compress = true;
    compiler.visitRoot(block).should.equal('color:#ff0000;color:#ff0000;');
    compiler.compress = false;
  }
};