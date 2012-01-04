
/*!
 * Stylus - nodes
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Constructors
 */

exports.Node = require('./node');
exports.Root = require('./root');
exports.Null = require('./null');
exports.Each = require('./each');
exports.If = require('./if');
exports.Call = require('./call');
exports.Page = require('./page');
exports.FontFace = require('./fontface');
exports.UnaryOp = require('./unaryop');
exports.BinOp = require('./binop');
exports.Ternary = require('./ternary');
exports.Block = require('./block');
exports.Unit = require('./unit');
exports.String = require('./string');
exports.HSLA = require('./hsla');
exports.RGBA = require('./rgba');
exports.Ident = require('./ident');
exports.Group = require('./group');
exports.Literal = require('./literal');
exports.JSLiteral = require('./jsliteral');
exports.Boolean = require('./boolean');
exports.Return = require('./return');
exports.Media = require('./media');
exports.Params = require('./params');
exports.Comment = require('./comment');
exports.Keyframes = require('./keyframes');
exports.Charset = require('./charset');
exports.Import = require('./import');
exports.Extend = require('./extend');
exports.Function = require('./function');
exports.Property = require('./property');
exports.Selector = require('./selector');
exports.Expression = require('./expression');
exports.Arguments = require('./arguments');

/**
 * Singletons.
 */

exports.true = new exports.Boolean(true);
exports.false = new exports.Boolean(false);
exports.null = new exports.Null;

/**
 * JS to Stylus conversion.
 */

exports.cast = function(val){
  switch (typeof val) {
    case 'string':
      return new exports.String(val);
    case 'number':
      return new exports.Unit(val);
    case 'boolean':
      return exports.Boolean(val);
    default:
      if (Array.isArray(val)) {
        var expr = new exports.Expression;
        expr.nodes = val.map(exports.cast);
        val = expr;
      }
      return val;
  }
};