
/**
 * Module dependencies.
 */

var Lexer = require('../lib/lexer')
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
    lex.lookahead(3).val.val.should.equal(3);
    lex.lookahead(2).val.val.should.equal(2);
    lex.lookahead(1).val.val.should.equal(1);
    lex.peek.val.val.should.equal(1);
    lex.next.val.val.should.equal(1);
    lex.next.val.val.should.equal(2);
  },
  
  'test single-line comment': function(){
    scan('// foo bar\n15px').type.should.equal('unit');
  },
  
  'test string': function(){
    scan('"foo"').type.should.equal('string');
    scan('"foo"').val.val.should.equal('foo');

    scan("'foo'").type.should.equal('string');
    scan("'foo'").val.val.should.equal('foo');
  },
  
  'test #nnn': function(){
    scan('#000').type.should.equal('color');
    scan('#000').val.should.eql({ r: 0, g: 0, b: 0, a: 1 });
    scan('#fca').val.should.eql({ r: 255, g: 204, b: 170, a: 1 });
  },
  
  'test #nnnnnn': function(){
    scan('#ffffff').type.should.equal('color');
    scan('#ffccaa').val.should.eql({ r: 255, g: 204, b: 170, a: 1 });
  },
  
  'test rgb(n,n,n)': function(){
    scan('rgb(255,204,170)').type.should.equal('color');
    scan('rgb(255,204,170)').val.should.eql({ r: 255, g: 204, b: 170, a: 1 });
    scan('rgb( 255 ,   204  , 170  )').val.should.eql({ r: 255, g: 204, b: 170, a: 1 });
  },
  
  'test rgba(n,n,n,n)': function(){
    scan('rgba(255,204,170,1)').type.should.equal('color');
    scan('rgba(255,204,170,1)').val.should.eql({ r: 255, g: 204, b: 170, a: 1 });
    scan('rgba(5,204,170,0.5)').val.should.eql({ r: 5, g: 204, b: 170, a: 0.5 });
    scan('rgba( 5 ,   204 , 170, 0.5)').val.should.eql({ r: 5, g: 204, b: 170, a: 0.5 });
    scan('rgba( 5 ,   204 , 170, 0.75)').val.should.eql({ r: 5, g: 204, b: 170, a: 0.75 });
    scan('rgba( 5 ,   204 , 170, .75)').val.should.eql({ r: 5, g: 204, b: 170, a: 0.75 });
  },
  
  'test variable': function(){
    scan('@foo').type.should.equal('variable');
    scan('@foo-bar').type.should.equal('variable');
    scan('@-foo-bar').type.should.equal('variable');
    scan('@_foo_bar_Baz').type.should.equal('variable');
    scan('@base64').type.should.equal('variable');
    scan('@base64').val.should.equal('base64');
  },
  
  'test assignment': function(){
    var lex = new Lexer('@color: #fff');
    lex.next.type.should.equal('variable');
    lex.next.type.should.equal('=');
    lex.next.type.should.equal('color');
    
    var lex = new Lexer('@color: #fff\n@dark: #000');
    lex.next.type.should.equal('variable');
    lex.next.type.should.equal('=');
    lex.next.type.should.equal('color');
    
    lex.next.type.should.equal('newline');

    lex.next.type.should.equal('variable');
    lex.next.type.should.equal('=');
    lex.next.type.should.equal('color');
  },
  
  'test selector': function(){
    var lex = new Lexer('body');
    lex.isSelector = true;
    lex.peek.type.should.equal('selector');
    lex.next.val.should.equal('body');
  },
  
  'test property': function(){
    var lex = new Lexer('body a\n  color #fff');

    lex.isSelector = true;
    lex.peek.type.should.equal('selector');
    lex.next.val.should.equal('body a');

    lex.next.type.should.equal('indent');

    lex.peek.type.should.equal('property');
    lex.next.val.should.equal('color');

    lex.next.type.should.equal('color');
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test \r\n': function(){
    var lex = new Lexer('body a\r\n  color #fff');
  
    lex.isSelector = true;
    lex.peek.type.should.equal('selector');
    lex.next.val.should.equal('body a');

    lex.next.type.should.equal('indent');

    lex.peek.type.should.equal('property');
    lex.next.val.should.equal('color');

    lex.next.type.should.equal('color');
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('eos');
  },
  
  'test \r': function(){
    var lex = new Lexer('body a\r  color #fff');

    lex.isSelector = true;
    lex.peek.type.should.equal('selector');
    lex.next.val.should.equal('body a');

    lex.next.type.should.equal('indent');

    lex.peek.type.should.equal('property');
    lex.next.val.should.equal('color');

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
    }, 'Invalid indentation, got 1 space(s), expected multiple of 2');
    
    err(function(){
      var lex = new Lexer('foo\n   bar');
      lex.next;
      lex.next;
    }, 'Invalid indentation, got 3 space(s), expected multiple of 2');
    
    err(function(){
      var lex = new Lexer('foo\n    bar');
      lex.next;
      lex.next;
    }, 'Invalid indentation, got 4 space(s), expected 2');
    
    var lex = new Lexer('foo\n  bar\n    baz\n  \n  \n  raz\n\n\n');
    lex.next; // foo
    lex.next.type.should.equal('indent');
    lex.next; // bar
    lex.next.type.should.equal('indent');
    lex.next; // baz
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('newline');
    lex.next.type.should.equal('newline');
    lex.next; // raz
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('newline');
    lex.next.type.should.equal('newline');
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
    lex.next.type.should.equal('newline');
    lex.next.type.should.equal('newline');
    lex.next; // raz
    lex.next.type.should.equal('outdent');
    lex.next.type.should.equal('newline');
    lex.next.type.should.equal('newline');
    lex.next.type.should.equal('eos');
  },
  
  'test keywords': function(){
    scan('auto').type.should.equal('keyword');
    scan('left').type.should.equal('keyword');
    scan('right').type.should.equal('keyword');
  },
  
  'test colors': function(){
    scan('white').type.should.equal('color');
    scan('white').val.should.eql({ r: 255, g: 255, b: 255, a: 1 });
    scan('black').val.should.eql({ r: 0, g: 0, b: 0, a: 1 });
  }
};