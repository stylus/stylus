
/**
 * Module dependencies.
 */

var Lexer = require('../../lib/lexer')
  , should = require('should');

function scan(str) {
  return new Lexer(str).next;
}

function err(fn, msg) {
  try {
    fn();
  } catch (e) {
    should.equal(msg, e.message);
    return;
  }
  throw new Error('expected exception "' + msg + '", but nothing was thrown.');
}

module.exports = {
  'test .peek': function(){
    var lex = new Lexer('1px 2px 3px');
    lex.peek.val.val.should.equal(1);
    lex.next.val.val.should.equal(1);

    lex.peek.val.val.should.equal(2);
    lex.next.val.val.should.equal(2);

    lex.peek.val.val.should.equal(3);
    lex.next.val.val.should.equal(3);
  },
  
  'test .lookahead(n)': function(){
    var lex = new Lexer('1px 2px 3px');
    lex.lookahead(5).type.should.equal('eos');
    lex.lookahead(4).type.should.equal('eos');
    lex.lookahead(3).val.val.should.equal(3);
    lex.lookahead(2).val.val.should.equal(2);
    lex.lookahead(1).val.val.should.equal(1);
    lex.peek.val.val.should.equal(1);
    lex.next.val.val.should.equal(1);
    lex.next.val.val.should.equal(2);
  },
  
  'test single-line comment': function(){
    var lex = new Lexer('// foo bar\n15px');
    lex.next.type.should.equal('newline');
    lex.next.type.should.equal('unit');
  },
  
  'test string': function(){
    scan('"foo"').type.should.equal('string');
    scan('"foo"').val.val.should.equal('foo');

    scan("'foo'").type.should.equal('string');
    scan("'foo'").val.val.should.equal('foo');
  },
  
  'test #nnn': function(){
    scan('#000').type.should.equal('color');
    scan('#fc0').val.r.should.equal(255);
    scan('#fc0').val.g.should.equal(204);
    scan('#fc0').val.b.should.equal(0);
    scan('#fc0').val.a.should.equal(1);
  },
  
  'test #nnnnnn': function(){
    scan('#ffffff').type.should.equal('color');
    scan('#ffccaa').val.r.should.equal(255);
    scan('#ffccaa').val.g.should.equal(204);
    scan('#ffccaa').val.b.should.equal(170);
    scan('#ffccaa').val.a.should.equal(1);
  },
  
  'test assignment': function(){
    var lex = new Lexer('color = #fff');
    lex.next.type.should.equal('ident');
    lex.next.type.should.equal('=');
    lex.next.type.should.equal('color');
    
    var lex = new Lexer('color = #fff\ndark= #000');
    lex.next.type.should.equal('ident');
    lex.next.type.should.equal('=');
    lex.next.type.should.equal('color');
    
    lex.next.type.should.equal('newline');

    lex.next.type.should.equal('ident');
    lex.next.type.should.equal('=');
    lex.next.type.should.equal('color');
  },
  
  'test property': function(){
    var lex = new Lexer('body a\n  -webkit-border-radius 12px');

    lex.isSelector = true;
    lex.peek.type.should.equal('ident');
    lex.next.val.name.should.equal('body');

    lex.peek.type.should.equal('ident');
    lex.next.val.name.should.equal('a');

    lex.next.type.should.equal('indent');

    lex.peek.type.should.equal('ident');
    lex.next.val.name.should.equal('-webkit-border-radius');

    lex.next.type.should.equal('unit');
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test property with complex values': function(){
    var lex = new Lexer('body\n  font 12px "Lucida Grande", Arial, sans-serif');

    lex.isSelector = true;
    lex.next.type.should.equal('ident');
    lex.next.type.should.equal('indent');

    lex.next.type.should.equal('ident');
    lex.isSelector = false;

    lex.next.type.should.equal('unit'); // 12px
    lex.next.type.should.equal('string'); // "Lucida Grande"
    lex.next.type.should.equal(',');
    lex.next.type.should.equal('ident'); // Arial
    lex.next.type.should.equal(',');
    lex.next.type.should.equal('ident'); // sans-serif
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test \r\n': function(){
    var lex = new Lexer('body a\r\n  color #fff');
  
    lex.isSelector = true;
    lex.peek.type.should.equal('ident');
    lex.next.val.name.should.equal('body');
    lex.next.val.name.should.equal('a');

    lex.next.type.should.equal('indent');

    lex.peek.type.should.equal('ident');
    lex.next.val.name.should.equal('color');

    lex.next.type.should.equal('color');
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test \r': function(){
    var lex = new Lexer('body a\r  color #fff');

    lex.isSelector = true;
    lex.next.type.should.equal('ident');
    lex.next.type.should.equal('ident');

    lex.next.type.should.equal('indent');

    lex.peek.type.should.equal('ident');
    lex.next.val.name.should.equal('color');

    lex.next.type.should.equal('color');
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test units': function(){
    var units = ['em', 'ex', 'px', 'cm', 'mm', 'in', 'pt', 'pc'
      , 'deg', 'rad', 'grad', 'ms', 's', 'Hz', 'kHz', '%'];

    scan('150').type.should.equal('unit');
    scan('150').val.val.should.equal(150);

    scan('15.99').type.should.equal('unit');
    scan('15.99').val.val.should.equal(15.99);

    units.forEach(function(unit){
      scan('1' + unit).type.should.equal('unit');
      scan('1' + unit).val.type.should.equal(unit);
      scan('1' + unit).val.val.should.equal(1);
      
      scan('150' + unit).type.should.equal('unit');
      scan('150' + unit).val.val.should.equal(150);
      
      scan('15.99' + unit).type.should.equal('unit');
      scan('15.99' + unit).val.val.should.equal(15.99);
    });
  },
  
  'test indentation': function(){
    err(function(){
      var lex = new Lexer('foo\n bar');
      lex.next;
      lex.next;
    }, 'Invalid indentation, got one space and expected multiple of two');
    
    err(function(){
      var lex = new Lexer('foo\n   bar');
      lex.next;
      lex.next;
    }, 'Invalid indentation, got 3 spaces and expected multiple of two');
    
    err(function(){
      var lex = new Lexer('foo\n    bar');
      lex.next;
      lex.next;
    }, 'Invalid indentation, got 4 spaces and expected two');
    
    var lex = new Lexer('foo\n  bar\n    baz\n  \n  \n  raz\n\n\n');
    lex.next; // foo
    lex.next.type.should.equal('indent');
    lex.next; // bar
    lex.next.type.should.equal('indent');
    lex.next; // baz
    lex.next.type.should.equal('outdent');
    lex.next; // raz
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test indentation with tabs': function(){
    var lex = new Lexer('foo\n\tbar\n\t\tbaz\n\t\n\t\n\traz\n\n\n');
    lex.next; // foo
    lex.next.type.should.equal('indent');
    lex.next; // bar
    lex.next.type.should.equal('indent');
    lex.next; // baz
    lex.next.type.should.equal('outdent');
    lex.next; // raz
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test identifiers': function(){
    scan('auto').type.should.equal('ident');
    scan('left').type.should.equal('ident');
    scan('right').type.should.equal('ident');
    
    var lex = new Lexer('black 14px sans-serif');
    lex.next.type.should.equal('color');
    lex.next.type.should.equal('unit');
    lex.next.type.should.equal('ident');
  },
  
  'test colors': function(){
    scan('white').type.should.equal('color');
    scan('white').val.r.should.equal(255);
    scan('white').val.g.should.equal(255);
    scan('white').val.b.should.equal(255);
    scan('white').val.a.should.equal(1);
    
    scan('black').val.r.should.equal(0);
    scan('black').val.g.should.equal(0);
    scan('black').val.b.should.equal(0);
    scan('black').val.a.should.equal(1);
  },
  
  'test url()': function(){
    var lex = new Lexer('url(/path/to some image.png)');
    lex.peek.type.should.equal('function');
    lex.next.val.name.should.equal('url');
    lex.peek.type.should.equal('string');
    lex.next.val.val.should.equal('/path/to some image.png');
    lex.next.type.should.equal(')');
    
    var lex = new Lexer('url("/my.png")');
    lex.next.val.name.should.equal('url');
    lex.peek.type.should.equal('string');
    lex.next.val.val.should.equal('/my.png');
    lex.next.type.should.equal(')');
    
    var lex = new Lexer("url('/my.png')");
    lex.next.val.name.should.equal('url');
    lex.peek.type.should.equal('string');
    lex.next.val.val.should.equal('/my.png');
    lex.next.type.should.equal(')');
  }
};