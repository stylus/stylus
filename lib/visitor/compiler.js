/*!
 * Stylus - Compiler
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes')
  , utils = require('../utils')
  , fs = require('fs');

/**
 * Initialize a new `Compiler` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the CSS output (default: false)
 *
 * @param {Node} root
 * @api public
 */

var Compiler = module.exports = function Compiler(root, options) {
  options = options || {};
  this.compress = options.compress;
  this.firebug = options.firebug;
  this.linenos = options.linenos;
  this.spaces = options['indent spaces'] || 2;
  this.includeCSS = options['include css'];
  this.indents = 1;
  Visitor.call(this, root);
  this.stack = [];
};

/**
 * Inherit from `Visitor.prototype`.
 */

Compiler.prototype.__proto__ = Visitor.prototype;

/**
 * Compile to css, and return a string of CSS.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.compile = function(){
  return this.visit(this.root);
};

/**
 * Return indentation string.
 *
 * @return {String}
 * @api private
 */

Compiler.prototype.__defineGetter__('indent', function(){
  if (this.compress) return '';
  return new Array(this.indents).join(Array(this.spaces + 1).join(' '));
});

/**
 * Check if given `node` needs brackets.
 *
 * @param {Node} node
 * @return {Boolean}
 * @api private
 */

Compiler.prototype.needBrackets = function(node){
  return 1 == this.indents
    || 'atrule' != node.nodeName
    || node.hasOnlyProperties;
};

/**
 * Visit Root.
 */

Compiler.prototype.visitRoot = function(block){
  this.buf = '';
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    var node = block.nodes[i];
    if (this.linenos || this.firebug) this.debugInfo(node);
    var ret = this.visit(node);
    if (ret) this.buf += ret + '\n';
  }
  return this.buf;
};

/**
 * Visit Block.
 */

Compiler.prototype.visitBlock = function(block){
  var node
    , needBrackets
    , arr = [];

  if (block.hasProperties && !block.lacksRenderedSelectors) {
    needBrackets = this.needBrackets(block.node);

    if (needBrackets) {
      var arr = [this.compress ? '{' : ' {'];
      ++this.indents;
    }
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = len - 1 == i;
      node = block.nodes[i];
      switch (node.nodeName) {
        case 'null':
        case 'expression':
        case 'function':
        case 'group':
        case 'block':
        case 'unit':
          continue;
        case 'media':
        case 'atrule':
          // Prevent double-writing the @media/@font-face declarations when
          // nested inside of a function/mixin
          if (node.block.parent.scope) {
            continue;
          }
        default:
          arr.push(this.visit(node));
      }
    }
    if (needBrackets) {
      --this.indents;
      arr.push(this.indent + '}');
    }
    this.buf += arr.join(this.compress ? '' : '\n');
    this.buf += (this.compress ? '' : '\n');
  }

  // Nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'group':
      case 'print':
      case 'block':
      case 'keyframes':
        if (this.linenos || this.firebug) this.debugInfo(node);
        this.visit(node);
        break;
      case 'media':
      case 'import':
      case 'atrule':
        this.visit(node);
        break;
      case 'comment':
        // only show comments inside when outside of scope and unsuppressed
        if (!block.scope && !node.suppress) {
          this.buf += this.visit(node) + '\n';
        }
        break;
      case 'literal':
        this.buf += this.visit(node) + '\n';
        break;
    }
  }
};

/**
 * Visit Keyframes.
 */

Compiler.prototype.visitKeyframes = function(node){
  if (!node.frames) return;

  var prefix = 'official' == node.prefix
    ? ''
    : '-' + node.prefix + '-';

  this.buf += '@' + prefix + 'keyframes '
    + this.visit(node.val)
    + (this.compress ? '{' : ' {\n');

  this.keyframe = true;
  ++this.indents;
  this.visit(node.block);
  --this.indents;
  this.keyframe = false;

  this.buf += '}' + (this.compress ? '' : '\n');
};

/**
 * Visit Media.
 */

Compiler.prototype.visitMedia = function(media){
  if (!media.hasProperties) return '';

  this.buf += '@media ';
  this.visit(media.val);
  this.buf += this.compress ? '{' : ' {\n';
  ++this.indents;
  this.visit(media.block);
  --this.indents;
  this.buf += '}' + (this.compress ? '' : '\n');
};

/**
 * Visit QueryList.
 */

Compiler.prototype.visitQueryList = function(queries){
  for (var i = 0, len = queries.nodes.length; i < len; ++i) {
    this.visit(queries.nodes[i]);
    if (len - 1 != i) this.buf += ',' + (this.compress ? '' : ' ');
  }
};

/**
 * Visit Query.
 */

Compiler.prototype.visitQuery = function(node){
  if (node.predicate) this.buf += node.predicate + ' ';
  for (var i = 0, len = node.nodes.length; i < len; ++i) {
    this.visit(node.nodes[i]);
    if (len - 1 != i) this.buf += ' and ';
  }
};

/**
 * Visit QueryExpr.
 */

Compiler.prototype.visitQueryExpr = function(node){
  if (!node.expr) {
    this.buf += node.name;
  } else if (node.expr.isEmpty) {
    this.buf += '(' + node.name + ')';
  } else {
    this.buf += '(' + node.name + ':' + (this.compress ? '' : ' ') + this.visit(node.expr) + ')';
  }
};

/**
 * Visit Import.
 */

Compiler.prototype.visitImport = function(imported){
  this.buf += '@import ' + this.visit(imported.path) + ';\n';
};

/**
 * Visit Atrule.
 */

Compiler.prototype.visitAtrule = function(atrule){
  this.buf += this.indent + '@' + atrule.type;

  if (atrule.val) this.buf += ' ' + atrule.val.trim();

  if (atrule.hasOnlyProperties) {
    this.visit(atrule.block);
  } else {
    this.buf += this.compress ? '{' : ' {\n';
    ++this.indents;
    this.visit(atrule.block);
    --this.indents;
    this.buf += this.indent + '}' + (this.compress ? '' : '\n');
  }
};

/**
 * Visit Comment.
 */

Compiler.prototype.visitComment = function(comment){
  return this.compress
    ? comment.suppress
      ? ''
      : comment.str
    : comment.str;
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
  return '@charset ' + this.visit(charset.val) + ';';
};

/**
 * Visit Namespace.
 */

Compiler.prototype.visitNamespace = function(namespace){
  return '@namespace '
    + (namespace.prefix ? this.visit(namespace.prefix) + ' ' : '')
    + this.visit(namespace.val) + ';';
};

/**
 * Visit Literal.
 */

Compiler.prototype.visitLiteral = function(lit){
  var val = lit.val.trim();
  if (!this.includeCSS) val = val.replace(/^  /gm, '');
  return val;
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

  // Compress
  if (this.compress) {
    // Always return '0' unless the unit is a percentage or time
    if ('%' != type && 's' != type && 'ms' != type && 0 == n) return '0';
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
  var stack = this.keyframe ? [] : this.stack
    , comma = this.compress ? ',' : ', ';

  stack.push(group.nodes);

  // selectors
  if (group.block.hasProperties) {
    var selectors = utils.compileSelectors.call(this, stack);
    if (selectors.length) {
      // keyframe blocks (10%, 20% { ... })
      if (this.keyframe) {
        selectors = selectors.map(function(selector, i) { return i ? selector.trim() : selector; });
        this.buf += selectors.join(comma);
      } else {
        this.buf += (this.selector = selectors.join(this.compress ? ',' : ',\n'));
      }
    } else {
      group.block.lacksRenderedSelectors = true;
    }
  }

  // output block
  this.visit(group.block);
  stack.pop();
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
  this.isURL = false;
  return call.name + '(' + args + ')';
};

/**
 * Visit Expression.
 */

Compiler.prototype.visitExpression = function(expr){
  var buf = []
    , self = this
    , len = expr.nodes.length
    , nodes = expr.nodes.map(function(node){ return self.visit(node); });

  nodes.forEach(function(node, i){
    var last = i == len - 1;
    buf.push(node);
    if ('/' == nodes[i + 1] || '/' == node) return;
    if (last) return;
    buf.push(expr.isList
      ? (self.compress ? ',' : ', ')
      : (self.isURL ? '' : ' '));
  });

  return buf.join('');
};

/**
 * Visit Arguments.
 */

Compiler.prototype.visitArguments = Compiler.prototype.visitExpression;

/**
 * Visit Property.
 */

Compiler.prototype.visitProperty = function(prop){
  var self = this
    , val = this.visit(prop.expr).trim();
  return this.indent + (prop.name || prop.segments.join(''))
    + (this.compress ? ':' + val : ': ' + val)
    + (this.compress
        ? (this.last ? '' : ';')
        : ';');
};

/**
 * Debug info.
 */

Compiler.prototype.debugInfo = function(node){

  var path = node.filename == 'stdin' ? 'stdin' : fs.realpathSync(node.filename)
    , line = node.nodes && node.nodes.length ? node.nodes[0].lineno : node.lineno;

  if (this.linenos){
    this.buf += '\n/* ' + 'line ' + line + ' : ' + path + ' */\n';
  }

  if (this.firebug){
    // debug info for firebug, the crazy formatting is needed
    path = 'file\\\:\\\/\\\/' + path.replace(/([.:/\\])/g, function(m) {
      return '\\' + (m === '\\' ? '\/' : m)
    });
    line = '\\00003' + line;
    this.buf += '\n@media -stylus-debug-info'
      + '{filename{font-family:' + path
      + '}line{font-family:' + line + '}}\n';
  }
}
