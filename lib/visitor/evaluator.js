
/*!
 * Stylus - Evaluator
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , nodes = require('../nodes')
  , Stack = require('../stack')
  , Frame = require('../stack/frame')
  , Scope = require('../stack/scope')
  , utils = require('../utils')
  , bifs = require('../functions')
  , dirname = require('path').dirname
  , colors = require('../colors')
  , fs = require('fs');

/**
 * Initialize a new `Evaluator` with the given `root` Node
 * and the following `options`.
 *
 * Options:
 *
 *   - `compress`  Compress the css output, defaults to false
 *   - `warn`  Warn the user of duplicate function definitions etc
 *
 * @param {Node} root
 * @api private
 */

var Evaluator = module.exports = function Evaluator(root, options) {
  options = options || {};
  Visitor.call(this, root);
  this.stack = new Stack;
  this.imports = options.imports || [];
  this.functions = options.functions || {};
  this.paths = options.paths || [];
  this.filename = options.filename;
  this.paths.push(dirname(options.filename || '.'));
  this.stack.push(this.global = new Frame(root));
  this.warnings = options.warn;
  this.options = options;
  this.calling = []; // TODO: remove, use stack
};

/**
 * Inherit from `Visitor.prototype`.
 */

Evaluator.prototype.__proto__ = Visitor.prototype;

/**
 * Proxy visit to expose node line numbers.
 *
 * @param {Node} node
 * @return {Node}
 * @api private
 */

var visit = Visitor.prototype.visit;
Evaluator.prototype.visit = function(node){
  try {
    return visit.call(this, node);
  } catch (err) {
    // TODO: less-lame hack to reference
    // the origin node source input
    this.lineno = this.lineno || node.lineno;
    err.str = err.str || node.source;
    err.stylusStack = err.stylusStack || this.stack.toString();
    throw err;
  }
};

/**
 * Perform evaluation setup:
 *
 *   - populate global scope
 *   - iterate imports
 *
 * @api private
 */

Evaluator.prototype.setup = function(){
  this.populateGlobalScope();
  this.imports.forEach(function(file){
    var expr = new nodes.Expression;
    expr.push(new nodes.String(file));
    this.visit(new nodes.Import(expr));
  }, this);
};

/**
 * Populate the global scope with:
 * 
 *   - css colors
 * 
 * @api private
 */

Evaluator.prototype.populateGlobalScope = function(){
  var scope = this.global.scope;
  Object.keys(colors).forEach(function(name){
    var rgb = colors[name]
      , rgba = new nodes.RGBA(rgb[0], rgb[1], rgb[2], 1)
      , node = new nodes.Ident(name, rgba);
    scope.add(node);
  });
};

/**
 * Evaluate the tree.
 *
 * @return {Node}
 * @api private
 */

Evaluator.prototype.evaluate = function(){
  this.setup();
  return this.visit(this.root);
};

/**
 * Visit Group.
 */

Evaluator.prototype.visitGroup = function(group){
  group.block = this.visit(group.block);
  return group;
};

/**
 * Visit Charset.
 */

Evaluator.prototype.visitCharset = function(charset){
  return charset;
};

/**
 * Visit Return.
 */

Evaluator.prototype.visitReturn = function(ret){
  ret.expr = this.visit(ret.expr);
  throw ret;
};

/**
 * Visit Media.
 */

Evaluator.prototype.visitMedia = function(media){
  media.block = this.visit(media.block);
  return media;
};

/**
 * Visit Keyframes.
 */

Evaluator.prototype.visitKeyframes = function(keyframes){
  keyframes.name = this.visit(keyframes.name).first.name;
  return keyframes;
};

/**
 * Visit Function.
 */

Evaluator.prototype.visitFunction = function(fn){
  // check local
  var local = this.stack.currentFrame.scope.lookup(fn.name);
  if (local) this.warn('local ' + local.nodeName + ' "' + fn.name + '" previously defined in this scope');

  // user-defined
  var user = this.functions[fn.name];
  if (user) this.warn('user-defined function "' + fn.name + '" is already defined');

  // BIF
  var bif = bifs[fn.name];
  if (bif) this.warn('built-in function "' + fn.name + '" is already defined');

  return fn;
};

/**
 * Visit Each.
 */

Evaluator.prototype.visitEach = function(each){
  var expr = utils.unwrap(this.visit(utils.unwrap(each.expr)))
    , len = expr.nodes.length
    , val = new nodes.Ident(each.val)
    , key = new nodes.Ident(each.key || '__index__')
    , scope = this.currentScope
    , block = this.currentBlock
    , vals = []
    , body;

  each.block.scope = false;
  for (var i = 0; i < len; ++i) {
    val.val = expr.nodes[i];
    key.val = new nodes.Unit(i);
    scope.add(val);
    scope.add(key);
    body = this.visit(each.block.clone());
    vals = vals.concat(body.nodes);
  }

  this.mixin(vals, block);
  return vals[vals.length - 1] || nodes.null;
};

/**
 * Visit Call.
 */

Evaluator.prototype.visitCall = function(call){
  var fn = this.lookup(call.name)
    , ret;

  // Variable function
  if (fn && 'expression' == fn.nodeName) {
    fn = fn.nodes[0];
  }

  // Not a function? try user-defined or built-ins
  if (fn && 'function' != fn.nodeName) {
    fn = this.lookupFunction(call.name);
  }

  // Undefined function, render literal css
  if (!fn || fn.nodeName != 'function') return this.literalCall(call);
  this.calling.push(call.name);

  // Massive stack
  if (this.calling.length > 200) {
    throw new RangeError('Maximum call stack size exceeded');
  }

  // First node in expression
  if (fn instanceof nodes.Expression) fn = fn.first;

  // Evaluate arguments
  var _ = this.return;
  this.return = true;
  var args = this.visit(call.args);
  this.return = _;

  // Built-in
  if (fn.fn) {
    ret = this.invokeBuiltin(fn.fn, args);
  // User-defined
  } else if (fn instanceof nodes.Function) {
    ret = this.invokeFunction(fn, args);
  }

  this.calling.pop();
  return ret;
};

/**
 * Visit Ident.
 */

Evaluator.prototype.visitIdent = function(ident){
  // Lookup
  if (nodes.null == ident.val) {
    var val = this.lookup(ident.name);
    return val ? this.visit(val) : ident;
  // Assign  
  } else {
    var _ = this.return;
    this.return = true;
    ident.val = this.visit(ident.val);
    this.return = _;
    this.currentScope.add(ident);
    return ident.val;
  }
};

/**
 * Visit BinOp.
 */

Evaluator.prototype.visitBinOp = function(binop){
  // Special-case "is defined" pseudo binop
  if ('is defined' == binop.op) return this.isDefined(binop.left);

  var _ = this.return;
  this.return = true;
  // Visit operands
  var op = binop.op
    , ident = 'ident' == binop.left.nodeName
    , left = this.visit(binop.left)
    , right = this.visit(binop.right);
  this.return = _;

  // First node in expression
  if (!~['[]', 'in'].indexOf(op)) {
    left = left.first;
    right = right.first;
  }

  // Coercion
  switch (op) {
    case '[]':
    case 'in':
    case '||':
    case '&&':
    case 'is a':
      break;
    default:
      // Special-case '-' against ident
      if ('-' == op
        && 'ident' == left.nodeName
        && 'unit' == right.nodeName) {
        var expr = new nodes.Expression;
        right.val = -right.val;
        expr.push(left);
        expr.push(right);
        return expr;
      }

      // Attempt coercion
      try {
        right = left.coerce(right);
      } catch (err) {
        // Disgregard coercion issues
        // and simply return false
        if ('==' == op || '!=' == op) {
          return nodes.false;
        } else {
          throw err;
        }
      }
  }

  // Operate
  return this.visit(left.operate(op, right));
};

/**
 * Visit UnaryOp.
 */

Evaluator.prototype.visitUnaryOp = function(unary){
  var op = unary.op
    , node = this.visit(unary.expr).first;

  if ('!' != op) utils.assertType(node, nodes.Unit);

  switch (op) {
    case '-':
      node.val = -node.val;
      break;
    case '+':
      node.val = +node.val;
      break;
    case '~':
      node.val = ~node.val;
      break;
    case '!':
      return node.toBoolean().negate();
  }
  
  return node;
};

/**
 * Visit TernaryOp.
 */

Evaluator.prototype.visitTernary = function(ternary){
  var ok = this.visit(ternary.cond).toBoolean();
  return nodes.true == ok
    ? this.visit(ternary.trueExpr)
    : this.visit(ternary.falseExpr);
};

/**
 * Visit Expression.
 */

Evaluator.prototype.visitExpression = function(expr){
  for (var i = 0, len = expr.nodes.length; i < len; ++i) {
    expr.nodes[i] = this.visit(expr.nodes[i]);
  }
  return expr;
};

/**
 * Visit Property.
 */

Evaluator.prototype.visitProperty = function(prop){
  var name = this.interpolate(prop)
    , fn = this.lookup(name)
    , call = fn instanceof nodes.Function
    , literal = ~this.calling.indexOf(name);

  // Function of the same name
  if (call && !literal && !prop.literal) {
    this.calling.push(name);
    var ret = this.visit(new nodes.Call(name, prop.expr));
    this.calling.pop();
    return ret;
  // Regular property
  } else {
    var _ = this.return;
    this.return = true;
    prop.expr = this.visit(prop.expr);
    prop.name = name;
    prop.literal = true;
    this.return = _;
    return prop;
  }
};

/**
 * Visit Root.
 */

Evaluator.prototype.visitRoot = function(block){
  for (var i = 0; i < block.nodes.length; ++i) {
    block.index = this.rootIndex = i;
    block.nodes[i] = this.visit(block.nodes[i]);
  }
  return block;
};

/**
 * Visit Block.
 */

Evaluator.prototype.visitBlock = function(block){
  this.stack.push(new Frame(block));
  for (var i = 0; i < block.nodes.length; ++i) {
    block.index = i;
    try {
      block.nodes[i] = this.visit(block.nodes[i]);
    } catch (err) {
      if (err instanceof nodes.Return) {
        if (this.return) {
          this.stack.pop();
          throw err;
        } else {
          block.nodes[i] = err;
          break;
        }
      } else {
        throw err;
      }
    }
  }
  this.stack.pop();
  return block;
};

/**
 * Visit If.
 */

Evaluator.prototype.visitIf = function(node){
  var ret
    , _ = this.return
    , block = this.currentBlock
    , negate = node.negate;

  this.return = true;
  var ok = this.visit(node.cond).first.toBoolean();
  this.return = _;

  // Evaluate body
  if (negate) {
    // unless
    if (nodes.false == ok) {
      ret = this.visit(node.block);
    }
  } else {
    // if
    if (nodes.true == ok) {
      ret = this.visit(node.block);
    // else
    } else if (node.elses.length) {
      var elses = node.elses
        , len = elses.length;
      for (var i = 0; i < len; ++i) {
        // else if
        if (elses[i].cond) {
          if (nodes.true == this.visit(elses[i].cond).first.toBoolean()) {
            ret = this.visit(elses[i].block);
            break;
          }
        // else 
        } else {
          ret = this.visit(elses[i]);
        }
      }
    }
  }

  // mixin conditional statements within a selector group
  if (ret && !node.postfix && block.node && 'group' == block.node.nodeName) {
    this.mixin(ret.nodes, block);
    return nodes.null;
  }

  return ret || nodes.null;
};

/**
 * Visit Import.
 */

Evaluator.prototype.visitImport = function(import){
  var found
    , root = this.root
    , i = this.rootIndex
    , stylus = require('../stylus')
    , path = this.visit(import.path).first
    , relative = this.importPath;

  // Enusre string
  if (!path.string) throw new Error('@import string expected');
  var name = path = path.string;

  // Literal
  if (/\.css$/.test(path)) return import;
  path += '.styl';

  // Lookup
  if (relative) this.paths.push(relative);
  found = utils.lookup(path, this.paths, this.filename);
  found = found || utils.lookup(name + '/index.styl', this.paths, this.filename);
  if (relative) this.paths.pop();

  // Expose imports
  import.path = found;
  if (this.options._imports) this.options._imports.push(import);

  // Throw if import failed
  if (!found) throw new Error('failed to locate @import file ' + path);
  this.importPath = dirname(found);

  // Parse the file
  var str = fs.readFileSync(found, 'utf8')
    , rest = root.nodes.splice(++i, root.nodes.length);

  stylus.parse(str, {
      filename: found
    , root: root
  });

  rest.forEach(function(node){
    root.push(node);
  });

  return nodes.null;
};

/**
 * Invoke `fn` with `args`.
 *
 * @param {Function} fn
 * @param {Array} args
 * @return {Node}
 * @api private
 */

Evaluator.prototype.invokeFunction = function(fn, args){
  var block = new nodes.Block(fn.block.parent);
  fn.block.parent = block;

  // Clone the function body
  // to prevent mutation of subsequent calls
  // inject argument scope
  var body = fn.block.clone();

  // mixin block
  var mixinBlock = this.stack.currentFrame.block;

  // new block scope
  this.stack.push(new Frame(block));
  var scope = this.currentScope;

  // arguments local
  scope.add(new nodes.Ident('arguments', args));

  // mixin scope introspection
  scope.add(new nodes.Ident('mixin', this.return
    ? nodes.false
    : new nodes.String(mixinBlock.nodeName)));

  // inject arguments as locals
  fn.params.nodes.forEach(function(node, i){
    // rest param support
    if (node.rest) {
      node.val = new nodes.Expression;
      for (var len = args.nodes.length; i < len; ++i) {
        node.val.push(args.nodes[i]);
      }
      node.val.preserve = true;
    // argument default support
    } else {
      var arg = args.nodes[i];
      var val = arg && !arg.isEmpty
        ? args.nodes[i]
        : node.val;
      node = node.clone();
      node.val = val;
      // required argument not satisfied
      if (node.val instanceof nodes.Null) {
        throw new Error('argument ' + node + ' required for ' + fn);
      }
    }

    scope.add(node);
  });

  // invoke
  return this.invoke(body, true);
};

/**
 * Invoke built-in `fn` with `args`.
 *
 * @param {Function} fn
 * @param {Array} args
 * @return {Node}
 * @api private
 */

Evaluator.prototype.invokeBuiltin = function(fn, args){
  // Map arguments to first node
  // providing a nicer js api for
  // BIFs. Functions may specify that
  // they wish to accept full expressions
  // via .raw
  if (fn.raw) {
    args = args.nodes;
  } else {
    args = args.nodes.map(function(node){
      return node.first;
    });
  }

  // Invoke the BIF
  var body = fn.apply(this, args);

  // Always wrapping allows js functions
  // to return several values with a single
  // Expression node
  var expr = new nodes.Expression;
  expr.push(body);
  body = expr;

  // Invoke
  return this.invoke(body);
};

/**
 * Invoke the given function `body`.
 *
 * @param {Block} body
 * @return {Node}
 * @api private
 */

Evaluator.prototype.invoke = function(body, stack){
  var self = this
    , ret;

  // Return
  if (this.return) {
    ret = this.eval(body.nodes);
    if (stack) this.stack.pop();
  // Mixin
  } else {
    body = this.visit(body);
    if (stack) this.stack.pop();
    this.mixin(body.nodes, this.currentBlock);
    ret = nodes.null;
  }

  return ret;
};

/**
 * Mixin the given `nodes` to the given `block`.
 *
 * @param {Array} nodes
 * @param {Block} block
 * @api private
 */

Evaluator.prototype.mixin = function(nodes, block){
  var len = block.nodes.length
    , head = block.nodes.slice(0, block.index)
    , tail = block.nodes.slice(block.index + 1, len);
  this._mixin(nodes, head);
  block.nodes = head.concat(tail);
};

/**
 * Mixin the given `nodes` to the `dest` array.
 *
 * @param {Array} nodes
 * @param {Array} dest
 * @api private
 */

Evaluator.prototype._mixin = function(nodes, dest){
  var node
    , len = nodes.length;
  for (var i = 0; i < len; ++i) {
    switch ((node = nodes[i]).nodeName) {
      case 'return':
        return;
      case 'block':
        this._mixin(node.nodes, dest);
        break;
      default:
        dest.push(node);
    }
  }
};

/**
 * Evaluate the given `vals`.
 *
 * @param {Array} vals
 * @return {Node}
 * @api private
 */

Evaluator.prototype.eval = function(vals){
  if (!vals) return nodes.null;
  var len = vals.length
    , node = nodes.null;

  try {
    for (var i = 0; i < len; ++i) {
      node = vals[i];
      switch (node.nodeName) {
        case 'if':
          if ('block' != node.block.nodeName) {
            node = this.visit(node);
            break;
          }
        case 'each':
        case 'block':
          node = this.visit(node);
          if (node.nodes) node = this.eval(node.nodes);
          break;
        default:
          node = this.visit(node);
      }
    }
  } catch (err) {
    if (err instanceof nodes.Return) {
      return err.expr;
    } else {
      throw err;
    }
  }

  return node;
};

/**
 * Literal function `call`.
 *
 * @param {Call} call
 * @return {call}
 * @api private
 */

Evaluator.prototype.literalCall = function(call){
  call.args = this.visit(call.args);
  return call;
};

/**
 * Lookup `name`, with support for JavaScript
 * functions, and BIFs.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Evaluator.prototype.lookup = function(name){
  var val;
  if (val = this.stack.lookup(name)) {
    return utils.unwrap(val);
  } else {
    return this.lookupFunction(name);
  }
};

/**
 * Map segments in `node` returning a string.
 *
 * @param {Node} node
 * @return {String}
 * @api private
 */

Evaluator.prototype.interpolate = function(node){
  var self = this;
  return node.segments.map(function(node){
    function toString(node) {
      switch (node.nodeName) {
        case 'function':
        case 'ident':
          return node.name;
        case 'literal':
        case 'string':
        case 'unit':
          return node.val;
        case 'expression':
          var _ = self.return;
          self.return = true;
          var ret = toString(self.visit(node).first); 
          self.return = _;
          return ret;
      }
    }
    return toString(node);
  }).join('');
};

/**
 * Lookup JavaScript user-defined or built-in function.
 *
 * @param {String} name
 * @return {Function}
 * @api private
 */

Evaluator.prototype.lookupFunction = function(name){
  var fn = this.functions[name] || bifs[name];
  if (fn) return new nodes.Function(name, fn);
};

/**
 * Check if the given `node` is an ident, and if it is defined.
 *
 * @param {Node} node
 * @return {Boolean}
 * @api private
 */

Evaluator.prototype.isDefined = function(node){
  if (node instanceof nodes.Ident) {
    return nodes.Boolean(this.lookup(node.name));
  } else {
    throw new Error('invalid "is defined" check on non-variable ' + node);
  }
};

/**
 * Warn with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

Evaluator.prototype.warn = function(msg){
  if (!this.warnings) return;
  console.warn('\033[33mWarning:\033[0m ' + msg);
};

/**
 * Return the current `Block`.
 *
 * @return {Block}
 * @api private
 */

Evaluator.prototype.__defineGetter__('currentBlock', function(){
  return this.stack.currentFrame.block;
});

/**
 * Return the current frame `Scope`.
 *
 * @return {Scope}
 * @api private
 */

Evaluator.prototype.__defineGetter__('currentScope', function(){
  return this.stack.currentFrame.scope;
});

/**
 * Return the current `Frame`.
 *
 * @return {Frame}
 * @api private
 */

Evaluator.prototype.__defineGetter__('currentFrame', function(){
  return this.stack.currentFrame;
});
