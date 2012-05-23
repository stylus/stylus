
/*!
 * Stylus - Evaluator
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Visitor = require('./')
  , units = require('../units')
  , nodes = require('../nodes')
  , Stack = require('../stack')
  , Frame = require('../stack/frame')
  , Scope = require('../stack/scope')
  , utils = require('../utils')
  , Importer = require('../importer')
  , bifs = require('../functions')
  , dirname = require('path').dirname
  , join = require('path').join
  , colors = require('../colors')
  , debug = require('debug')('stylus:evaluator')
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
  this.globals = options.globals || {};
  this.paths = options.paths || [];
  this.filename = options.filename;
  this.stack.push(this.global = new Frame(root));
  this.warnings = options.warn;
  this.options = options;
  this.calling = []; // TODO: remove, use stack
  this.importStack = [];
  this.return = 0;
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
Evaluator.prototype.visit = function(node, fn){
  var self = this;
  try {
    if(fn) return visit.call(this, node, function(err, result) {
      if(err) return handleError(err);
      fn(null, result);
    });
    return visit.call(this, node);
  } catch (err) {
    return handleError(err);
  }
  function handleError(err) {
    fn = fn || function(err) { throw err; };
    if (err.filename) return fn(err);
    err.lineno = node.lineno;
    err.filename = node.filename;
    err.stylusStack = self.stack.toString();
    try {
      err.input = fs.readFileSync(err.filename, 'utf8');
    } catch (err) {
      // ignore
    }
    fn(err);
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
  var root = this.root;
  var imports = [];

  this.populateGlobalScope();
  this.imports.forEach(function(file){
    var expr = new nodes.Expression;
    expr.push(new nodes.String(file));
    imports.push(new nodes.Import(expr));
  }, this);

  root.nodes = imports.concat(root.nodes);
};

/**
 * Populate the global scope with:
 *
 *   - css colors
 *   - user-defined globals
 *
 * @api private
 */

Evaluator.prototype.populateGlobalScope = function(){
  var scope = this.global.scope;

  // colors
  Object.keys(colors).forEach(function(name){
    var rgb = colors[name]
      , rgba = new nodes.RGBA(rgb[0], rgb[1], rgb[2], 1)
      , node = new nodes.Ident(name, rgba);
    scope.add(node);
  });

  // user-defined globals
  var globals = this.globals;
  Object.keys(globals).forEach(function(name){
    scope.add(new nodes.Ident(name, globals[name]));
  });
};

/**
 * Evaluate the tree, then callback `fn(err, ast)`.
 *
 * @param {Function} fn
 * @api private
 */

Evaluator.prototype.evaluate = function(fn){
  try {
    debug('eval %s', this.filename);
    this.setup();
    this.visit(this.root, fn);
  } catch(err) {
    fn(err);
  }
};

/**
 * Visit Group.
 */

Evaluator.prototype.visitGroup = function(group, fn){
  group.nodes = group.nodes.map(function(selector){
    selector.val = this.interpolate(selector);
    debug('ruleset %s', selector.val);
    return selector;
  }, this);

  if(fn) {
    return this.visit(group.block, function(err, block) {
      if(err) return fn(err);
      group.block = block;
      fn(null, group);
    });
  }

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
 * Visit FontFace.
 */

Evaluator.prototype.visitFontFace = function(face){
  face.block = this.visit(face.block);
  return face;
};

/**
 * Visit FontFace.
 */

Evaluator.prototype.visitPage = function(page){
  page.block = this.visit(page.block);
  return page;
};

/**
 * Visit Keyframes.
 */

Evaluator.prototype.visitKeyframes = function(keyframes){
  if (keyframes.fabricated) return keyframes;
  keyframes.name = this.visit(keyframes.name).first.name;

  keyframes.frames = keyframes.frames.map(function(frame){
    frame.block = this.visit(frame.block);
    return frame;
  }, this);

  if ('official' != keyframes.prefix) return keyframes;

  this.vendors.forEach(function(prefix){
    var node = keyframes.clone();
    node.prefix = prefix;
    node.fabricated = true;
    this.currentBlock.push(node);
  }, this);

  return nodes.null;
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
  this.return++;
  var expr = utils.unwrap(this.visit(utils.unwrap(each.expr)))
    , len = expr.nodes.length
    , val = new nodes.Ident(each.val)
    , key = new nodes.Ident(each.key || '__index__')
    , scope = this.currentScope
    , block = this.currentBlock
    , vals = []
    , body;
  this.return--;

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
  debug('call %s', call);
  var fn = this.lookup(call.name)
    , ret;

  // url()
  this.ignoreColors = 'url' == call.name;

  // Variable function
  if (fn && 'expression' == fn.nodeName) {
    fn = fn.nodes[0];
  }

  // Not a function? try user-defined or built-ins
  if (fn && 'function' != fn.nodeName) {
    fn = this.lookupFunction(call.name);
  }

  // Undefined function, render literal css
  if (!fn || fn.nodeName != 'function') {
    debug('%s is undefined', call);
    var ret = this.literalCall(call);
    this.ignoreColors = false;
    return ret;
  }

  this.calling.push(call.name);

  // Massive stack
  if (this.calling.length > 200) {
    throw new RangeError('Maximum stylus call stack size exceeded');
  }

  // First node in expression
  if ('expression' == fn.nodeName) fn = fn.first;

  // Evaluate arguments
  this.return++;
  var args = this.visit(call.args);
  for (var key in call.args.map) {
    call.args.map[key] = this.visit(call.args.map[key]);
  }
  this.return--;

  // Built-in
  if (fn.fn) {
    debug('%s is built-in', call);
    ret = this.invokeBuiltin(fn.fn, args);
  // User-defined
  } else if ('function' == fn.nodeName) {
    debug('%s is user-defined', call);
    ret = this.invokeFunction(fn, args);
  }

  this.calling.pop();
  this.ignoreColors = false;
  return ret;
};

/**
 * Visit Ident.
 */

Evaluator.prototype.visitIdent = function(ident){
  var prop;
  // Property lookup
  if (ident.property) {
    if (prop = this.lookupProperty(ident.name)) {
      return this.visit(prop.expr.clone());
    }
    return nodes.null;
  // Lookup
  } else if (ident.val.isNull) {
    var val = this.lookup(ident.name);
    return val ? this.visit(val) : ident;
  // Assign
  } else {
    this.return++;
    ident.val = this.visit(ident.val);
    this.return--;
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

  this.return++;
  // Visit operands
  var op = binop.op
    , left = this.visit(binop.left)
    , right = this.visit(binop.right);
  this.return--;

  // HACK: ternary
  var val = binop.val
    ? this.visit(binop.val)
    : null;

  // Operate
  try {
    return this.visit(left.operate(op, right, val));
  } catch (err) {
    // disregard coercion issues in equality
    // checks, and simply return false
    if ('CoercionError' == err.name) {
      switch (op) {
        case '==':
          return nodes.false;
        case '!=':
          return nodes.true;
      }
    }
    throw err;
  }
};

/**
 * Visit UnaryOp.
 */

Evaluator.prototype.visitUnaryOp = function(unary){
  var op = unary.op
    , node = this.visit(unary.expr);

  if ('!' != op) {
    node = node.first.clone();
    utils.assertType(node, 'unit');
  }

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
  return ok.isTrue
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

  // support (n * 5)px etc
  if (this.castable(expr)) expr = this.cast(expr);

  return expr;
};

/**
 * Visit Arguments.
 */

Evaluator.prototype.visitArguments = Evaluator.prototype.visitExpression;

/**
 * Visit Property.
 */

Evaluator.prototype.visitProperty = function(prop){
  var name = this.interpolate(prop)
    , fn = this.lookup(name)
    , call = fn && 'function' == fn.nodeName
    , literal = ~this.calling.indexOf(name);

  // Function of the same name
  if (call && !literal && !prop.literal) {
    this.calling.push(name);
    var args = nodes.Arguments.fromExpression(utils.unwrap(prop.expr));
    var ret = this.visit(new nodes.Call(name, args));
    this.calling.pop();
    return ret;
  // Regular property
  } else {
    this.return++;
    prop.name = name;
    prop.literal = true;
    this.property = prop;
    prop.expr = this.visit(prop.expr);
    delete this.property;
    this.return--;
    return prop;
  }
};

function visitNodes(block, root, fn) {
  if(fn) {

    var self = this;
    if(!root) self.stack.push(new Frame(block));
    block.index = 0;
    function next() {
      var blockNodes = block.nodes;
      self.visit(blockNodes[block.index], function returnInVisitNodes(err, node) {
        if(err) return _break(err);
        blockNodes[block.index] = node;
        _continue();
      });
    }
    function _continue() {
      ++block.index;
      if(root) self.rootIndex = block.index;
      if(block.index < block.nodes.length) return next();
      return _break();
    }
    function _break(err) {
      if(err) return fn(err);
      if(!root) self.stack.pop();
      return fn(null, block);
    }
    return next();

  } else {

    if(!root) this.stack.push(new Frame(block));
    for (block.index = 0; block.index < block.nodes.length; ++block.index) {
      if(root) this.rootIndex = block.index;
      var blockNodes = block.nodes;
      var ret = this.visit(blockNodes[block.index]);
      blockNodes[block.index] = ret;
    }
    if(!root) this.stack.pop();
    return block;
  }
}

/**
 * Visit Root.
 */

Evaluator.prototype.visitRoot = function(block, fn){
  return visitNodes.call(this, block, true, fn);
};

/**
 * Visit Block.
 */

Evaluator.prototype.visitBlock = function(block, fn){
  debugger;
  var self = this;
  try {
    return visitNodes.call(self, block, false, fn && function(err, result) {
      if(err) return handleError(err);
      return fn(null, result);
    });
  } catch(err) {
    return handleError(err);
  }
  function handleError(err) {
    if ('return' == err.nodeName) {
      if (self.return) {
        self.stack.pop();
        if(fn) return fn(err);
        throw err;
      } else {
        block.nodes[block.index] = err;
        self.stack.pop();
        if(fn) return fn(null, block);
        return block;
      }
    } else {
      if(fn) return fn(err);
      throw err;
    }
  }

};

/**
 * Visit If.
 */

Evaluator.prototype.visitIf = function(node, fn){
  var ret
    , self = this
    , block = this.currentBlock
    , negate = node.negate
    , done = false;

  // support synchron and asynchron call style
  var finish = fn && function(err, ret) {
    if(err) return fn(err);

    // mixin conditional statements within a selector group
    if (ret && !node.postfix && block.node && 'group' == block.node.nodeName) {
      self.mixin(ret.nodes, block);
      return fn(null, nodes.null);
    }

    fn(null, ret || nodes.null);
  }

  this.return++;
  var ok = this.visit(node.cond).first.toBoolean();
  this.return--;

  // Evaluate body
  if (negate) {
    // unless
    if (ok.isFalse) {
      ret = this.visit(node.block, finish);
      done = true;
    }
  } else {
    // if
    if (ok.isTrue) {
      ret = this.visit(node.block, finish);
      done = true;
    // else
    } else if (node.elses.length) {
      var elses = node.elses
        , len = elses.length;
      for (var i = 0; i < len; ++i) {
        // else if
        if (elses[i].cond) {
          if (this.visit(elses[i].cond).first.toBoolean().isTrue) {
            ret = this.visit(elses[i].block, finish);
            done = true;
            break;
          }
        // else
        } else {
          ret = this.visit(elses[i], finish);
          done = true;
        }
      }
    }
  }
  if(finish && !done) return finish(null, nodes.null);
  if(!finish) {
    // mixin conditional statements within a selector group
    if (ret && !node.postfix && block.node && 'group' == block.node.nodeName) {
      self.mixin(ret.nodes, block);
      return nodes.null;
    }

    return ret || nodes.null;
  }
  return; // async
};

/**
 * Visit Extend.
 */

Evaluator.prototype.visitExtend = function(extend){
  var selector = extend.selector;
  this.currentBlock.node.extends.push(selector);
  return nodes.null;
};

/**
 * Visit Import.
 */

Evaluator.prototype.visitImport = function(imported, fn){
  if(!fn) throw new Error("visitImport should be call asynchron");
  var self = this;
  self.return++;

  var root = self.root
    , Parser = require('../parser')
    , path = self.visit(imported.path).first
    , importer;

  self.return--;
  debug('import %s', path);

  // url() passed
  if ('url' == path.name) return fn(null, imported);

  // Enusre string
  if (!path.string) return fn(new Error('@import string expected'));
  var name = path = path.string;

  importer = new Importer(path, self.options);

  importer.lookup(function(err, found) {
    if(err) return fn(err);

    if(!found) return fn(null, imported);

    // Expose imports
    imported.path = found;
    imported.dirname = dirname(found);
    // self.paths.push(imported.dirname);
    if (self.options._imports) self.options._imports.push(imported);

    // Parse the file
    self.importStack.push(found);
    nodes.filename = found;

    importer.import(function(err, result) {
      if(err) return fn(err);

      var str = result.str;
      if (result.literal) return fn(null, new nodes.Literal(str.replace(/\r\n?/g, "\n")));

      // parse
      var block = new nodes.Block
        , parser = new Parser(str, utils.merge({
          root: block,
          filename: found
        }, self.options));

      try {
        block = parser.parse();
      } catch (err) {
        err.filename = found;
        err.lineno = parser.lexer.lineno;
        err.input = str;
        return fn(err);
      }

      imported.mtime = result.mtime;

      // Evaluate imported "root"
      block.parent = root;
      block.scope = false;
      var oldFilename = self.options.filename;
      self.options.filename = found;
      self.visit(block, function(err, ret) {
        if(err) return fn(err);
        self.options.filename = oldFilename;
        self.importStack.pop();
        process.nextTick(fn.bind(null, null, ret));
      });
    });
  });
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

  // current property
  if (this.property) {
    var prop = this.propertyExpression(this.property, fn.name);
    scope.add(new nodes.Ident('current-property', prop));
  } else {
    scope.add(new nodes.Ident('current-property', nodes.null));
  }

  // inject arguments as locals
  var i = 0
    , len = args.nodes.length;
  fn.params.nodes.forEach(function(node){
    // rest param support
    if (node.rest) {
      node.val = new nodes.Expression;
      for (; i < len; ++i) node.val.push(args.nodes[i]);
      node.val.preserve = true;
    // argument default support
    } else {
      var arg = args.map[node.name] || args.nodes[i++];
      node = node.clone();
      if (arg) {
        if (!arg.isEmpty) node.val = arg;
      } else {
        args.push(node.val);
      }

      // required argument not satisfied
      if (node.val.isNull) {
        throw new Error('argument "' + node + '" required for ' + fn);
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
    args = utils.params(fn).reduce(function(ret, param){
      var arg = args.map[param] || args.nodes.shift();
      if (arg) ret.push(arg.first);
      return ret;
    }, []);
  }

  // Invoke the BIF
  var body = utils.coerce(fn.apply(this, args));

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
    var targetFrame = this.stack[this.stack.length - 2];
    if (targetFrame) var targetBlock = targetFrame.block;
    body = this.visit(body);
    if (stack) this.stack.pop();
    this.mixin(body.nodes, targetBlock || this.currentBlock);
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

Evaluator.prototype.mixin = function(newNodes, block){
  var len = block.nodes.length
    , head = block.nodes.slice(0, block.index)
    , tail = block.nodes.slice(block.index + 1, len);
  this._mixin(newNodes, head);
  block.index = head.length-1;
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
    if ('return' == err.nodeName) {
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
 * Lookup property `name`.
 *
 * @param {String} name
 * @return {Property}
 * @api private
 */

Evaluator.prototype.lookupProperty = function(name){
  var i = this.stack.length
    , prop = this.property
    , curr = prop && prop.name
    , index = this.currentBlock.index
    , top = i
    , nodes
    , block
    , other;

  while (i--) {
    block = this.stack[i].block;
    if (!block.node) continue;
    switch (block.node.nodeName) {
      case 'group':
      case 'function':
        nodes = block.nodes;
        // scan siblings from the property index up
        if (i + 1 == top) {
          while (index--) {
            other = this.interpolate(nodes[index]);
            if (name == other) return nodes[index].clone();
          }
        // sequential lookup for non-siblings (for now)
        } else {
          for (var j = 0, len = nodes.length; j < len; ++j) {
            if ('property' != nodes[j].nodeName) continue;
            other = this.interpolate(nodes[j]);
            if (name == other) return nodes[j].clone();
          }
        }
        break;
    }
  }

  return nodes.null;
};

/**
 * Return the closest mixin-able `Block`.
 *
 * @return {Block}
 * @api private
 */

Evaluator.prototype.__defineGetter__('closestBlock', function(){
  var i = this.stack.length
    , block;
  while (i--) {
    block = this.stack[i].block;
    if (block.node) {
      switch (block.node.nodeName) {
        case 'group':
        case 'function':
          return block;
      }
    }
  }
});

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
  if (this.ignoreColors && name in colors) return;
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
          self.return++;
          var ret = toString(self.visit(node).first);
          self.return--;
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
  if ('ident' == node.nodeName) {
    return nodes.Boolean(this.lookup(node.name));
  } else {
    throw new Error('invalid "is defined" check on non-variable ' + node);
  }
};

/**
 * Return `Expression` based on the given `prop`,
 * replacing cyclic calls to the given function `name`
 * with "__CALL__".
 *
 * @param {Property} prop
 * @param {String} name
 * @return {Expression}
 * @api private
 */

Evaluator.prototype.propertyExpression = function(prop, name){
  var expr = new nodes.Expression
    , val = prop.expr.clone();

  // name
  expr.push(new nodes.String(prop.name));

  // replace cyclic call with __CALL__
  function replace(node) {
    if ('call' == node.nodeName && name == node.name) {
      return new nodes.Literal('__CALL__');
    }

    if (node.nodes) node.nodes = node.nodes.map(replace);
    return node;
  }

  replace(val);
  expr.push(val);
  return expr;
};

/**
 * Cast `expr` to the trailing ident.
 *
 * @param {Expression} expr
 * @return {Unit}
 * @api private
 */

Evaluator.prototype.cast = function(expr){
  return new nodes.Unit(expr.first.val, expr.nodes[1].name);
};

/**
 * Check if `expr` is castable.
 *
 * @param {Expression} expr
 * @return {Boolean}
 * @api private
 */

Evaluator.prototype.castable = function(expr){
  return 2 == expr.nodes.length
    && 'unit' == expr.first.nodeName
    && ~units.indexOf(expr.nodes[1].name);
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
 * Return an array of vendor names.
 *
 * @return {Array}
 * @api private
 */

Evaluator.prototype.__defineGetter__('vendors', function(){
  return this.lookup('vendors').nodes.map(function(node){
    return node.string;
  });
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
