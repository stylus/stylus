
/*!
 * Stylus - Compiler
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes');

/**
 * Initialize a new `Compiler` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the css output, defaults to false
 *
 * @param {Node} root
 * @api public
 */

var Compiler = module.exports = function Compiler(root, options) {
  options = options || {};
  this.compress = options.compress;
  this.indents = 1;
  Visitor.call(this, root);
  this.tree = [];
};

/**
 * Inherit from `Visitor.prototype`.
 */

Compiler.prototype.__proto__ = Visitor.prototype;

/**
 * Compile to css, and callback `fn(err, css)`.
 *
 * @param {Function} fn
 * @api public
 */

Compiler.prototype.compile = function(fn){
  this.callback = fn;
  this.css = this.visit(this.root);
  fn(null, this.css);
};

/**
 * Return indentation string.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.__defineGetter__('indent', function(){
  return this.compress
     ? ''
     : new Array(this.indents).join('  ');
});

/**
 * Visit Root.
 */

Compiler.prototype.visitRoot = function(block){
  this.buf = '';
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    if (node instanceof nodes.Null
      || node instanceof nodes.Expression
      || node instanceof nodes.Function
      || node instanceof nodes.Unit) continue;
    var ret = this.visit(node);
    if (ret) this.buf += ret + '\n';
  }
  return this.buf;
};

/**
 * Visit Block.
 */

Compiler.prototype.visitBlock = function(block){
  if (block.hasProperties) {
    var arr = [this.compress ? '{' : ' {'];
    ++this.indents;
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = len - 1 == i;
      var node = block.nodes[i];
      if (node instanceof nodes.Null
        || node instanceof nodes.Expression
        || node instanceof nodes.Function
        || node instanceof nodes.Group
        || node instanceof nodes.Unit) continue;
      arr.push(this.visit(node));
    }
    --this.indents;
    arr.push(this.indent + '}');
    this.buf += arr.join(this.compress ? '' : '\n');
    this.buf += '\n';
  }

  // Nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    this.visit(block.nodes[i]);
  }
};

/**
 * Visit Keyframes.
 */

Compiler.prototype.visitKeyframes = function(node){
  this.buf += '@-webkit-keyframes '
    + this.visit(node.name)
    + (this.compress ? '{' : ' {');
  ++this.indents;
  node.frames.forEach(function(frame){
    if (!this.compress) this.buf += '\n  ';
    this.buf += this.visit(frame.pos);
    this.visit(frame.block);
  }, this);
  --this.indents;
  this.buf += '}' + (this.compress ? '' : '\n');
};

/**
 * Visit Media.
 */

Compiler.prototype.visitMedia = function(media){
  this.buf += '@media ' + media.val;
  this.buf += this.compress ? '{' : ' {\n';
  ++this.indents;
  this.visit(media.block);
  --this.indents;
  this.buf += '}' + (this.compress ? '' : '\n');
};

/**
 * Visit Page.
 */

Compiler.prototype.visitPage = function(page){
  this.buf += this.indent + '@page';
  this.buf += page.selector ? ' ' + page.selector : '';
  this.visit(page.block);
};

/**
 * Visit Function.
 */

Compiler.prototype.visitFunction = function(fn){
  return fn.name;
};

/**
 * Visit Variable.
 */

Compiler.prototype.visitVariable = function(variable){
  return '';
};

/**
 * Visit Charset.
 */

Compiler.prototype.visitCharset = function(charset){
  return '@charset ' + this.visit(charset.val);
};

/**
 * Visit Literal.
 */

Compiler.prototype.visitLiteral = function(lit){
  return lit.val.trim().replace(/^  /gm, '');
};

/**
 * Visit Boolean.
 */

Compiler.prototype.visitBoolean = function(bool){
  return bool.toString();
};

/**
 * Visit RGBA.
 */

Compiler.prototype.visitRGBA = function(rgba){
  return rgba.toString();
};

/**
 * Visit HSLA.
 */

Compiler.prototype.visitHSLA = function(hsla){
  return hsla.rgba.toString();
};

/**
 * Visit Unit.
 */

Compiler.prototype.visitUnit = function(unit){
  var type = unit.type || ''
    , n = unit.val
    , float = n != (n | 0);

  // Int
  if ('px' == type) n = n.toFixed(0);
  // Compress
  if (this.compress) {
    // Zero is always '0'
    if (0 == n) return '0';
    // Omit leading '0' on floats
    if (float && n < 1 && n > -1) {
      return n.toString().replace('0.', '.') + type;
    }
  }

  return n.toString() + type;
};

/**
 * Visit Group.
 */

Compiler.prototype.visitGroup = function(group){
  var self = this
    , tree = this.tree
    , prev = tree[tree.length - 1]
    , curr = [];

  // Construct an array of arrays
  // representing the selector hierarchy
  group.nodes.forEach(function(node){
    curr.push(node.parent
        ? node
        : node.val);
  });

  tree.push(curr);

  // Reverse recurse the
  // hierarchy array to build
  // up the selector permutations.
  // When we reach root, we have our
  // selector string built
  var selectors = []
    , buf = [];
  function join(arr, i) {
    if (i) {
      arr[i].forEach(function(str){
        buf.unshift(str);
        join(arr, i - 1);
        buf.shift();
      });
    } else {
      arr[0].forEach(function(selector){
        var str = selector;
        if (buf.length) {
          for (var i = 0, len = buf.length; i < len; ++i) {
            if (~buf[i].indexOf('&')) {
              str = buf[i].replace('&', str);
            } else {
              str += ' ' + buf[i];
            }
          }
        }
        selectors.push(self.indent + str);
      });
    }
  }

  // Join selectors
  if (group.block.hasProperties) {
    join(tree, tree.length - 1);
    this.buf += selectors.join(this.compress ? ',' : ',\n');
  }

  // Output blocks
  this.visit(group.block);
  tree.pop();
};

/**
 * Visit Ident.
 */

Compiler.prototype.visitIdent = function(ident){
  return ident.name;
};

/**
 * Visit String.
 */

Compiler.prototype.visitString = function(string){
  return this.isURL
    ? string.val
    : string.toString();
};

/**
 * Visit Null.
 */

Compiler.prototype.visitNull = function(node){
  return '';
};

/**
 * Visit Call.
 */

Compiler.prototype.visitCall = function(call){
  this.isURL = 'url' == call.name;
  var args = call.args.nodes.map(function(arg){
    return this.visit(arg);
  }, this).join(this.compress ? ',' : ', ');
  if (this.isURL) args = '"' + args + '"';
  delete this.isURL;
  return call.name + '(' + args + ')';
};

/**
 * Visit Import.
 */

Compiler.prototype.visitImport = function(import){
  return '@import ' + this.visit(import.path) + ';';
};

/**
 * Visit Expression.
 */

Compiler.prototype.visitExpression = function(expr){
  return expr.nodes.map(function(node){
    return this.visit(node);
  }, this).join(expr.isList
      ? (this.compress ? ',' : ', ')
      : (this.isURL ? '' : ' '));
};

/**
 * Visit Property.
 */

Compiler.prototype.visitProperty = function(prop){
  var self = this
    , val = this.visit(prop.expr);
  return this.indent + (prop.name || prop.segments.join(''))
    + (this.compress ? ':' + val : ': ' + val)
    + (this.compress
        ? (this.last ? '' : ';')
        : ';');
};
