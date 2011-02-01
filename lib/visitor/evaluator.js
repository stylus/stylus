
/*!
 * CSS - Evaluator
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
  this.paths.push(dirname(options.filename || '.'));
  this.stack.push(this.global = new Frame(root));
  this.setup();
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
    this.visit(new nodes.Import(file));
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
      , color = new nodes.Color(rgb[0], rgb[1], rgb[2], 1)
      , node = new nodes.Ident(name, color);
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
  return this.visit(this.root);
};

/**
 * Visit Group.
 */

Evaluator.prototype.visitGroup = function(group){
  this.group = group;
  group.block = this.visit(group.block);
  this.group = null;
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
  return ret;
};

/**
 * Visit Each.
 */

Evaluator.prototype.visitEach = function(each){
  var body
    , eachBlock = each.block
    , expr = utils.unwrap(this.visit(utils.unwrap(each.expr)))
    , len = expr.nodes.length
    , val = new nodes.Ident(each.val)
    , key = new nodes.Ident(each.key || '__index__')
    , scope = this.stack.currentFrame.scope
    , block = this.stack.currentFrame.block;

  eachBlock.scope = false;
  for (var i = 0; i < len; ++i) {
    val.val = expr.nodes[i];
    key.val = new nodes.Unit(i);
    scope.add(val);
    scope.add(key);
    body = this.visit(eachBlock.clone());
    this.mixin(body.nodes, block);
  }
  block.scope = true;

  return nodes.null;
};


/**
 * Visit Call.
 */

Evaluator.prototype.visitCall = function(call){
  var ret
    , fn = this.lookup(call.name);

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
    this.stack.currentFrame.scope.add(ident);
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
  if ('[]' != op) {
    left = left.first;
    right = right.first;
  }

  // Coercion
  switch (op) {
    case '[]':
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
  if (call && !literal) {
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
    this.return = _;
    return prop;
  }
};

/**
 * Visit Root.
 */

Evaluator.prototype.visitRoot = function(block){
  for (var i = 0; i < block.nodes.length; ++i) {
    this.rootIndex = i;
    block.nodes[i] = this.visit(block.nodes[i]);
  }
  return block;
};

/**
 * Visit Block.
 */

Evaluator.prototype.visitBlock = function(block){
  if (block.scope) this.stack.push(new Frame(block));
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    block.nodes[i] = this.visit(block.nodes[i]);
  }
  if (block.scope) this.stack.pop();
  return block;
};

/**
 * Visit If.
 */

Evaluator.prototype.visitIf = function(node){
  var ret
    , _ = this.return
    , group = this.group
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

  // Selector mixin
  if (group && ret && !this.return) {
    this.mixin(ret.nodes, group.block);
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
    , path = import.path
    , relative = this.importPath;

  // Literal
  if (/\.css$/.test(path)) return import;
  path += '.styl';

  // Lookup
  if (relative) this.paths.push(relative);
  found = utils.lookup(path, this.paths);
  if (relative) this.paths.pop();

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
  // Clone the function body
  // to prevent mutation of subsequent calls
  var body = fn.block.clone();

  // Inject argument scope
  var block = new nodes.Block(body.parent);
  body.parent = block;

  // New block scope
  this.stack.push(new Frame(block));
  var scope = this.stack.currentFrame.scope;

  // arguments local
  scope.add(new nodes.Ident('arguments', args));

  // Inject arguments as locals
  fn.params.nodes.forEach(function(node, i){
    // rest param support
    if (node.rest) {
      node.val = new nodes.Expression;
      for (var len = args.nodes.length; i < len; ++i) {
        node.val.push(args.nodes[i]);
      }
    // Argument default support
    } else {
      var arg = args.nodes[i];
      var val = arg && !arg.isEmpty
        ? args.nodes[i]
        : node.val;
      node = node.clone();
      node.val = val;
      // Required argument not satisfied
      if (node.val instanceof nodes.Null) {
        throw new Error('argument ' + node + ' required for ' + fn);
      }
    }

    scope.add(node);
  });

  // Evaluate
  body = this.visit(body);
  this.stack.pop();

  // Invoke
  return this.invoke(body);
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

Evaluator.prototype.invoke = function(body){
  var self = this;

  // Return
  if (this.return) {
    return this.eval(body.nodes);
  // Mixin
  } else {
    this.mixin(body.nodes, this.stack.currentFrame.block);
    return nodes.null;
  }
};

/**
 * Mixin the given `nodes`.
 *
 * @param {Array} nodes
 * @param {Block} block
 * @api private
 */

Evaluator.prototype.mixin = function(nodes, block){
  var node
    , len = nodes.length;
  for (var i = 0; i < len; ++i) {
    switch ((node = nodes[i]).nodeName) {
      case 'return':
        return;
      case 'block':
        this.mixin(node.nodes, block);
        break;
      default:
        block.nodes.push(node);
    }
  }
};

/**
 * Evaluate the given `nodes`.
 *
 * @param {Array} nodes
 * @return {Node}
 * @api private
 */

Evaluator.prototype.eval = function(nodes){
  var node
    , len = nodes.length;
  for (var i = 0; i < len; ++i) {
    switch ((node = nodes[i]).nodeName) {
      case 'return':
        return node.expr;
      case 'block':
        return this.eval(node.nodes);
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
        case 'string':
          return node.val;
        case 'expression':
          return toString(self.visit(node).first);
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
