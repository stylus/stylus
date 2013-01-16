var stylus = (function(){var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("/lib/renderer.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Renderer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Parser = require('./parser')
  , EventEmitter = require('events').EventEmitter
  , Compiler = require('./visitor/compiler')
  , Evaluator = require('./visitor/evaluator')
  , Normalizer = require('./visitor/normalizer')
  , utils = require('./utils')
  , nodes = require('./nodes')
  , path = require('path')
  , join = path.join;

/**
 * Expose `Renderer`.
 */

module.exports = Renderer;

/**
 * Initialize a new `Renderer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api public
 */

function Renderer(str, options) {
  options = options || {};
  options.globals = {};
  options.functions = {};
  options.imports = [join(__dirname, 'functions')];
  options.paths = options.paths || [];
  options.filename = options.filename || 'stylus';
  this.options = options;
  this.str = str;
};

/**
 * Inherit from `EventEmitter.prototype`.
 */

Renderer.prototype.__proto__ = EventEmitter.prototype;

/**
 * Parse and evaluate AST, then callback `fn(err, css, js)`.
 *
 * @param {Function} fn
 * @api public
 */

Renderer.prototype.render = function(fn){
  var parser = this.parser = new Parser(this.str, this.options);
  try {
    nodes.filename = this.options.filename;
    // parse
    var ast = parser.parse();

    // evaluate
    this.evaluator = new Evaluator(ast, this.options);
    ast = this.evaluator.evaluate();

    // normalize
    var normalizer = new Normalizer(ast, this.options);
    ast = normalizer.normalize();

    // compile
    var compiler = new Compiler(ast, this.options)
      , css = compiler.compile();

    this.emit('end', css);
    if (!fn) return css;
    fn(null, css);
  } catch (err) {
    var options = {};
    options.input = err.input || this.str;
    options.filename = err.filename || this.options.filename;
    options.lineno = err.lineno || parser.lexer.lineno;
    if (!fn) throw utils.formatException(err, options);
    fn(utils.formatException(err, options));
  }
};

/**
 * Set option `key` to `val`.
 *
 * @param {String} key
 * @param {Mixed} val
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.set = function(key, val){
  this.options[key] = val;
  return this;
};

/**
 * Get option `key`.
 *
 * @param {String} key
 * @return {Mixed} val
 * @api public
 */

Renderer.prototype.get = function(key){
  return this.options[key];
};

/**
 * Include the given `path` to the lookup paths array.
 *
 * @param {String} path
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.include = function(path){
  this.options.paths.push(path);
  return this;
};

/**
 * Use the given `fn`.
 *
 * This allows for plugins to alter the renderer in
 * any way they wish, exposing paths etc.
 *
 * @param {Function}
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.use = function(fn){
  fn.call(this, this);
  return this;
};

/**
 * Define function or global var with the given `name`. Optionally
 * the function may accept full expressions, by setting `raw`
 * to `true`.
 *
 * @param {String} name
 * @param {Function|Node} fn
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.define = function(name, fn, raw){
  fn = utils.coerce(fn);

  if (fn.nodeName) {
    this.options.globals[name] = fn;
    return this;
  }

  // function
  this.options.functions[name] = fn;
  if (undefined != raw) fn.raw = raw;
  return this;
};

/**
 * Import the given `file`.
 *
 * @param {String} file
 * @return {Renderer} for chaining
 * @api public
 */

Renderer.prototype.import = function(file){
  this.options.imports.push(file);
  return this;
};



});

require.define("/lib/parser.js",function(require,module,exports,__dirname,__filename,process,global){ 
/*!
 * Stylus - Parser
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Lexer = require('./lexer')
  , nodes = require('./nodes')
  , Token = require('./token')
  , inspect = require('util').inspect
  , errors = require('./errors');

// debuggers

var debug = {
    lexer: require('debug')('stylus:lexer')
  , selector: require('debug')('stylus:parser:selector')
};

/**
 * Selector composite tokens.
 */

var selectorTokens = [
    'ident'
  , 'string'
  , 'selector'
  , 'function'
  , 'comment'
  , 'boolean'
  , 'space'
  , 'color'
  , 'unit'
  , 'for'
  , 'in'
  , '['
  , ']'
  , '('
  , ')'
  , '+'
  , '-'
  , '*'
  , '*='
  , '<'
  , '>'
  , '='
  , ':'
  , '&'
  , '~'
  , '{'
  , '}'
];

/**
 * CSS3 pseudo-selectors.
 */

var pseudoSelectors = [
    'root'
  , 'nth-child'
  , 'nth-last-child'
  , 'nth-of-type'
  , 'nth-last-of-type'
  , 'first-child'
  , 'last-child'
  , 'first-of-type'
  , 'last-of-type'
  , 'only-child'
  , 'only-of-type'
  , 'empty'
  , 'link'
  , 'visited'
  , 'active'
  , 'hover'
  , 'focus'
  , 'target'
  , 'lang'
  , 'enabled'
  , 'disabled'
  , 'checked'
  , 'not'
];

/**
 * Initialize a new `Parser` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

var Parser = module.exports = function Parser(str, options) {
  var self = this;
  options = options || {};
  this.lexer = new Lexer(str, options);
  this.root = options.root || new nodes.Root;
  this.state = ['root'];
  this.stash = [];
  this.parens = 0;
  this.css = 0;
  this.state.pop = function(){
    self.prevState = [].pop.call(this);
  };
};

/**
 * Parser prototype.
 */

Parser.prototype = {
  
  /**
   * Constructor.
   */
  
  constructor: Parser,
  
  /**
   * Return current state.
   *
   * @return {String}
   * @api private
   */
  
  currentState: function() {
    return this.state[this.state.length - 1];
  },
  
  /**
   * Parse the input, then return the root node.
   *
   * @return {Node}
   * @api private
   */
  
  parse: function(){
    var block = this.parent = this.root;
    while ('eos' != this.peek().type) {
      if (this.accept('newline')) continue;
      var stmt = this.statement();
      this.accept(';');
      if (!stmt) this.error('unexpected token {peek}, not allowed at the root level');
      block.push(stmt);
    }
    return block;
  },
  
  /**
   * Throw an `Error` with the given `msg`.
   *
   * @param {String} msg
   * @api private
   */
  
  error: function(msg){
    var type = this.peek().type
      , val = undefined == this.peek().val
        ? ''
        : ' ' + this.peek().toString();
    if (val.trim() == type.trim()) val = '';
    throw new errors.ParseError(msg.replace('{peek}', '"' + type + val + '"'));
  },
  
  /**
   * Accept the given token `type`, and return it,
   * otherwise return `undefined`.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  accept: function(type){
    if (type == this.peek().type) {
      return this.next();
    }
  },

  /**
   * Expect token `type` and return it, throw otherwise.
   *
   * @param {String} type
   * @return {Token}
   * @api private
   */

  expect: function(type){
    if (type != this.peek().type) {
      this.error('expected "' + type + '", got {peek}');
    }
    return this.next();
  },
  
  /**
   * Get the next token.
   *
   * @return {Token}
   * @api private
   */
  
  next: function() {
    var tok = this.stash.length
      ? this.stash.pop()
      : this.lexer.next();
    nodes.lineno = tok.lineno;
    debug.lexer('%s %s', tok.type, tok.val || '');
    return tok;
  },
  
  /**
   * Peek with lookahead(1).
   *
   * @return {Token}
   * @api private
   */
  
  peek: function() {
    return this.lexer.peek();
  },
  
  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Token}
   * @api private
   */
  
  lookahead: function(n){
    return this.lexer.lookahead(n);
  },
  
  /**
   * Check if the token at `n` is a valid selector token. 
   *
   * @param {Number} n
   * @return {Boolean}
   * @api private
   */
  
  isSelectorToken: function(n) {
    var la = this.lookahead(n).type;
    switch (la) {
      case 'for':
        return this.bracketed;
      case '[':
        this.bracketed = true;
        return true;
      case ']':
        this.bracketed = false;
        return true;
      default:
        return ~selectorTokens.indexOf(la);
    }
  },
  
  /**
   * Check if the token at `n` is a pseudo selector.
   *
   * @param {Number} n
   * @return {Boolean}
   * @api private
   */
  
  isPseudoSelector: function(n){
    return ~pseudoSelectors.indexOf(this.lookahead(n).val.name);
  },

  /**
   * Check if the current line contains `type`.
   *
   * @param {String} type
   * @return {Boolean}
   * @api private
   */

  lineContains: function(type){
    var i = 1
      , la;

    while (la = this.lookahead(i++)) {
      if (~['indent', 'outdent', 'newline'].indexOf(la.type)) return;
      if (type == la.type) return true;
    }
  },
  
  /**
   * Valid selector tokens.
   */
  
  selectorToken: function() {
    if (this.isSelectorToken(1)) {
      if ('{' == this.peek().type) {
        // unclosed, must be a block
        if (!this.lineContains('}')) return;
        // check if ':' is within the braces.
        // though not required by stylus, chances
        // are if someone is using {} they will
        // use css-style props, helping us with
        // the ambiguity in this case
        var i = 0
          , la;
        while (la = this.lookahead(++i)) {
          if ('}' == la.type) break;
          if (':' == la.type) return;
        }
      }
      return this.next();
    }
  },
  
  /**
   * Consume whitespace.
   */

  skipWhitespace: function() {
    while (~['space', 'indent', 'outdent', 'newline'].indexOf(this.peek().type))
      this.next();
  },

  /**
   * Consume newlines.
   */

  skipNewlines: function() {
    while ('newline' == this.peek().type)
      this.next();
  },

  /**
   * Consume spaces.
   */
  
  skipSpaces: function() {
    while ('space' == this.peek().type)
      this.next();
  },
  
  /**
   * Check if the following sequence of tokens
   * forms a function definition, ie trailing
   * `{` or indentation.
   */

  looksLikeFunctionDefinition: function(i) {
    return 'indent' == this.lookahead(i).type
      || '{' == this.lookahead(i).type;
  },
  
  /**
   * Check if the following sequence of tokens
   * forms a selector.
   */
  
  looksLikeSelector: function() {
    var i = 1
      , brace;

    // Assume selector when an ident is
    // followed by a selector
    while ('ident' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type) i += 2;

    while (this.isSelectorToken(i)
      || ',' == this.lookahead(i).type) {

      if ('selector' == this.lookahead(i).type)
        return true;

      // the ':' token within braces signifies
      // a selector. ex: "foo{bar:'baz'}"
      if ('{' == this.lookahead(i).type) brace = true;
      else if ('}' == this.lookahead(i).type) brace = false;
      if (brace && ':' == this.lookahead(i).type) return true;

      // '}' preceded by a space is considered a selector.
      // for example "foo{bar}{baz}" may be a property,
      // however "foo{bar} {baz}" is a selector
      if ('space' == this.lookahead(i).type
        && '{' == this.lookahead(i + 1).type)
        return true;

      // Assume pseudo selectors are NOT properties
      // as 'td:th-child(1)' may look like a property
      // and function call to the parser otherwise
      if (':' == this.lookahead(i++).type
        && !this.lookahead(i-1).space
        && this.isPseudoSelector(i))
        return true;

      if (',' == this.lookahead(i).type
        && 'newline' == this.lookahead(i + 1).type)
        return true;
    }

    // Trailing comma
    if (',' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type)
      return true;

    // Trailing brace
    if ('{' == this.lookahead(i).type
      && 'newline' == this.lookahead(i + 1).type)
      return true;

    // css-style mode, false on ; }
    if (this.css) {
      if (';' == this.lookahead(i) ||
          '}' == this.lookahead(i))
        return false;
    }

    // Trailing separators
    while (!~[
        'indent'
      , 'outdent'
      , 'newline'
      , 'for'
      , 'if'
      , ';'
      , '}'
      , 'eos'].indexOf(this.lookahead(i).type))
      ++i;

    if ('indent' == this.lookahead(i).type)
      return true;
  },

  /**
   * Check if the current state supports selectors.
   */

  stateAllowsSelector: function() {
    switch (this.currentState()) {
      case 'root':
      case 'selector':
      case 'conditional':
      case 'keyframe':
      case 'function':
      case 'font-face':
      case 'media':
      case '-moz-document':
      case 'for':
        return true;
    }
  },

  /**
   *   statement
   * | statement 'if' expression
   * | statement 'unless' expression
   */
  
  statement: function() {
    var stmt = this.stmt()
      , state = this.prevState
      , block
      , op;

    // special-case statements since it
    // is not an expression. We could
    // implement postfix conditionals at
    // the expression level, however they
    // would then fail to enclose properties
    if (this.allowPostfix) {
      delete this.allowPostfix;
      state = 'expression';
    }

    switch (state) {
      case 'assignment':
      case 'expression':
      case 'function arguments':
        while (op =
             this.accept('if')
          || this.accept('unless')
          || this.accept('for')) {
          switch (op.type) {
            case 'if':
            case 'unless':
              stmt = new nodes.If(this.expression(), stmt);
              stmt.postfix = true;
              stmt.negate = 'unless' == op.type;
              this.accept(';');
              break;
            case 'for':
              var key
                , val = this.id().name;
              if (this.accept(',')) key = this.id().name;
              this.expect('in');
              var each = new nodes.Each(val, key, this.expression());
              block = new nodes.Block;
              block.push(stmt);
              each.block = block;
              stmt = each;
          }
        }
    }

    return stmt;
  },
  
  /**
   *    ident
   *  | selector
   *  | literal
   *  | charset
   *  | import
   *  | media
   *  | scope
   *  | keyframes
   *  | page
   *  | for
   *  | if
   *  | unless
   *  | comment
   *  | expression
   *  | 'return' expression
   */
  
  stmt: function() {
    var type = this.peek().type;
    switch (type) {
      case '-webkit-keyframes':
      case 'keyframes':
        return this.keyframes();
      case 'font-face':
        return this.fontface();
      case '-moz-document':
        return this.mozdocument();
      case 'comment':
      case 'selector':
      case 'literal':
      case 'charset':
      case 'import':
      case 'extend':
      case 'media':
      case 'page':
      case 'ident':
      case 'scope':
      case 'unless':
      case 'function':
      case 'for':
      case 'if':
        return this[type]();
      case 'return':
        return this.return();
      case '{':
        return this.property();
      default:
        // Contextual selectors
        if (this.stateAllowsSelector()) {
          switch (type) {
            case 'color':
            case '~':
            case '+':
            case '>':
            case '<':
            case ':':
            case '&':
            case '[':
              return this.selector();
            case '*':
              return this.property();
            case '-':
              if ('{' == this.lookahead(2).type)
                return this.property();
          }
        }

        // Expression fallback
        var expr = this.expression();
        if (expr.isEmpty) this.error('unexpected {peek}');
        return expr;
    }
  },
  
  /**
   * indent (!outdent)+ outdent
   */

  block: function(node, scope) {
    var delim
      , stmt
      , block = this.parent = new nodes.Block(this.parent, node);

    if (false === scope) block.scope = false;

    // css-style
    if (this.accept('{')) {
      this.css++;
      delim = '}';
      this.skipWhitespace();
    } else {
      delim = 'outdent';
      this.expect('indent');
    }

    while (delim != this.peek().type) {
      // css-style
      if (this.css) {
        if (this.accept('newline')) continue;
        stmt = this.statement();
        this.accept(';');
        this.skipWhitespace();
      } else {
        if (this.accept('newline')) continue;
        stmt = this.statement();
        this.accept(';');
      }
      if (!stmt) this.error('unexpected token {peek} in block');
      block.push(stmt);
    }

    // css-style
    if (this.css) {
      this.skipWhitespace();
      this.expect('}');
      this.skipSpaces();
      this.css--;
    } else {
      this.expect('outdent');
    }

    this.parent = block.parent;
    return block;
  },

  /**
   * comment space*
   */

  comment: function(){
    var node = this.next().val;
    this.skipSpaces();
    return node;
  },

  /**
   * for val (',' key) in expr
   */
  
  for: function() {
    this.expect('for');
    var key
      , val = this.id().name;
    if (this.accept(',')) key = this.id().name;
    this.expect('in');
    var each = new nodes.Each(val, key, this.expression());
    this.state.push('for');
    each.block = this.block(each, false);
    this.state.pop();
    return each;
  },
  
  /**
   * return expression
   */
  
  return: function() {
    this.expect('return');
    var expr = this.expression();
    return expr.isEmpty
      ? new nodes.Return
      : new nodes.Return(expr);
  },
  
  /**
   * unless expression block
   */
  
  unless: function() {
    this.expect('unless');
    var node = new nodes.If(this.expression(), true);
    this.state.push('conditional');
    node.block = this.block(node, false);
    this.state.pop();
    return node;
  },
  
  /**
   * if expression block (else block)?
   */

  if: function() {
    this.expect('if');
    var node = new nodes.If(this.expression());
    this.state.push('conditional');
    node.block = this.block(node, false);
    while (this.accept('else')) {
      if (this.accept('if')) {
        var cond = this.expression()
          , block = this.block(node, false);
        node.elses.push(new nodes.If(cond, block));
      } else {
        node.elses.push(this.block(node, false));
        break;
      }
    }
    this.state.pop();
    return node;
  },

  /**
   * scope
   */

  scope: function(){
    var val = this.expect('scope').val;
    this.selectorScope = val;
    return nodes.null;
  },

  /**
   * extend
   */

  extend: function(){
    var val = this.expect('extend').val;
    return new nodes.Extend(val);
  },

  /**
   * media
   */
  
  media: function() {
    var val = this.expect('media').val
      , media = new nodes.Media(val);
    this.state.push('media');
    media.block = this.block(media);
    this.state.pop();
    return media;
  },

  /**
   * @-moz-document block
   */

  mozdocument: function(){
    var val = this.expect('-moz-document').val
      , mozdocument = new nodes.MozDocument(val);
    this.state.push('-moz-document');
    mozdocument.block = this.block(mozdocument, false);
    this.state.pop();
    return mozdocument;
  },

  /**
   * fontface
   */
  
  fontface: function() {
    this.expect('font-face');
    var node = new nodes.FontFace;
    this.state.push('font-face');
    node.block = this.block(node);
    this.state.pop();
    return node;
  },

  /**
   * import expression
   */
   
  import: function() {
    this.expect('import');
    this.allowPostfix = true;
    return new nodes.Import(this.expression());
  },
  
  /**
   * charset string
   */
  
  charset: function() {
    this.expect('charset');
    var str = this.expect('string').val;
    this.allowPostfix = true;
    return new nodes.Charset(str);
  },
  
  /**
   * page selector? block
   */

  page: function() {
    var selector;
    this.expect('page');
    if (this.accept(':')) {
      var str = this.expect('ident').val.name;
      selector = new nodes.Literal(':' + str);
    }
    var page = new nodes.Page(selector);
    this.skipSpaces();
    this.state.push('page');
    page.block = this.block(page);
    this.state.pop();
    return page;
  },

  /**
   * keyframes name (
   *  (unit | from | to)
   *  (',' (unit | from | to)*)
   *  block)+
   */
   
  keyframes: function() {
    var pos
      , tok = this.expect('keyframes')
      , keyframes = new nodes.Keyframes(this.id(), tok.val)
      , vals = [];

    // css-style
    if (this.accept('{')) {
      this.css++;
      this.skipWhitespace();
    } else {
      this.expect('indent');
    }

    this.skipNewlines();

    while (pos = this.accept('unit') || this.accept('ident')) {
      // from | to
      if ('ident' == pos.type) {
        this.accept('space');
        switch (pos.val.name) {
          case 'from':
            pos = new nodes.Unit(0, '%');
            break;
          case 'to':
            pos = new nodes.Unit(100, '%');
            break;
          default:
            this.error('"' + pos.val.name + '" is invalid, use "from" or "to"');
        }
      } else {
        pos = pos.val;
      }

      vals.push(pos);

      // ','
      if (this.accept(',') || this.accept('newline')) continue;

      // block
      this.state.push('keyframe');
      var block = this.block(keyframes);
      keyframes.push(vals, block);
      vals = [];
      this.state.pop();
      if (this.css) this.skipWhitespace();
      this.skipNewlines();
    }

    // css-style
    if (this.css) {
      this.skipWhitespace();
      this.expect('}');
      this.css--;
    } else {
      this.expect('outdent');
    }

    return keyframes;
  },
  
  /**
   * literal
   */
  
  literal: function() {
    return this.expect('literal').val;
  },
  
  /**
   * ident space?
   */
  
  id: function() {
    var tok = this.expect('ident');
    this.accept('space');
    return tok.val;
  },
  
  /**
   *   ident
   * | assignment
   * | property
   * | selector
   */
  
  ident: function() {
    var i = 2
      , la = this.lookahead(i).type;

    while ('space' == la) la = this.lookahead(++i).type;

    switch (la) {
      // Assignment
      case '=':
      case '?=':
      case '-=':
      case '+=':
      case '*=':
      case '/=':
      case '%=':
        return this.assignment();
      // Assignment []=
      case '[':
        if (this._ident == this.peek()) return this.id();
        while (']' != this.lookahead(i++).type
          && 'selector' != this.lookahead(i).type) ;
        if ('=' == this.lookahead(i).type) {
          this._ident = this.peek();
          return this.expression();
        } else if (this.looksLikeSelector() && this.stateAllowsSelector()) {
          return this.selector();
        }
      // Operation
      case '-':
      case '+':
      case '/':
      case '*':
      case '%':
      case '**':
      case 'and':
      case 'or':
      case '&&':
      case '||':
      case '>':
      case '<':
      case '>=':
      case '<=':
      case '!=':
      case '==':
      case '?':
      case 'in':
      case 'is a':
      case 'is defined':
        // Prevent cyclic .ident, return literal
        if (this._ident == this.peek()) {
          return this.id();
        } else {
          this._ident = this.peek();
          switch (this.currentState()) {
            // unary op or selector in property / for
            case 'for':
            case 'selector':
              return this.property();
            // Part of a selector
            case 'root':
            case 'media':
            case '-moz-document':
            case 'font-face':
              return this.selector();
            case 'function':
              return this.looksLikeSelector()
                ? this.selector()
                : this.expression();
            // Do not disrupt the ident when an operand
            default:
              return this.operand
                ? this.id()
                : this.expression();
          }
        }
      // Selector or property
      default:
        switch (this.currentState()) {
          case 'root':
            return this.selector();
          case 'for':
          case 'page':
          case 'media':
          case '-moz-document':
          case 'font-face':
          case 'selector':
          case 'function':
          case 'keyframe':
          case 'conditional':
            return this.property();
          default:
            return this.id();
        }
    }
  },
  
  /**
   * '*'? (ident | '{' expression '}')+
   */
  
  interpolate: function() {
    var node
      , segs = []
      , star;

    star = this.accept('*');
    if (star) segs.push(new nodes.Literal('*'));

    while (true) {
      if (this.accept('{')) {
        this.state.push('interpolation');
        segs.push(this.expression());
        this.expect('}');
        this.state.pop();
      } else if (node = this.accept('-')){
        segs.push(new nodes.Literal('-'));
      } else if (node = this.accept('ident')){
        segs.push(node.val);
      } else {
        break;
      }
    }
    if (!segs.length) this.expect('ident');
    return segs;
  },
  
  /**
   *   property ':'? expression
   * | ident
   */

  property: function() {
    if (this.looksLikeSelector()) return this.selector();

    // property
    var ident = this.interpolate()
      , prop = new nodes.Property(ident)
      , ret = prop;

    // optional ':'
    this.accept('space');
    if (this.accept(':')) this.accept('space');

    this.state.push('property');
    this.inProperty = true;
    prop.expr = this.list();
    if (prop.expr.isEmpty) ret = ident[0];
    this.inProperty = false;
    this.allowPostfix = true;
    this.state.pop();

    // optional ';'
    this.accept(';');

    return ret;
  },
  
  /**
   *   selector ',' selector
   * | selector newline selector
   * | selector block
   */

  selector: function() {
    var tok
      , arr
      , group = new nodes.Group
      , scope = this.selectorScope
      , isRoot = 'root' == this.currentState();

    do {
      arr = [];

      // Clobber newline after ,
      this.accept('newline');

      // Selector candidates,
      // stitched together to
      // form a selector.
      while (tok = this.selectorToken()) {
        debug.selector('%s', tok);
        // Selector component
        switch (tok.type) {
          case '{':
            this.skipSpaces();
            var expr = this.expression();
            this.skipSpaces();
            this.expect('}');
            arr.push(expr);
            break;
          case 'comment':
            arr.push(new nodes.Literal(tok.val.str));
            break;
          case 'color':
            arr.push(new nodes.Literal(tok.val.raw));
            break;
          case 'space':
            arr.push(new nodes.Literal(' '));
            break;
          case 'function':
            arr.push(new nodes.Literal(tok.val.name + '('));
            break;
          case 'ident':
            arr.push(new nodes.Literal(tok.val.name));
            break;
          default:
            arr.push(new nodes.Literal(tok.val));
            if (tok.space) arr.push(new nodes.Literal(' '));
        }
      }

      // Push the selector
      if (isRoot && scope) arr.unshift(new nodes.Literal(scope + ' '));
      group.push(new nodes.Selector(arr));
    } while (this.accept(',') || this.accept('newline'));

    this.state.push('selector');
    group.block = this.block(group);
    this.state.pop();


    return group;
  },
  
  /**
   * ident ('=' | '?=') expression
   */
  
  assignment: function() {
    var op
      , node
      , name = this.id().name;

    if (op =
         this.accept('=')
      || this.accept('?=')
      || this.accept('+=')
      || this.accept('-=')
      || this.accept('*=')
      || this.accept('/=')
      || this.accept('%=')) {
      this.state.push('assignment');
      var expr = this.list();
      if (expr.isEmpty) this.error('invalid right-hand side operand in assignment, got {peek}')
      node = new nodes.Ident(name, expr);
      this.state.pop();

      switch (op.type) {
        case '?=':
          var defined = new nodes.BinOp('is defined', node)
            , lookup = new nodes.Ident(name);
          node = new nodes.Ternary(defined, lookup, node);
          break;
        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
          node.val = new nodes.BinOp(op.type[0], new nodes.Ident(name), expr);
          break;
      }
    }

    return node;
  },
  
  /**
   *   definition
   * | call
   */
  
  function: function() {
    var parens = 1
      , i = 2
      , tok;

    // Lookahead and determine if we are dealing
    // with a function call or definition. Here
    // we pair parens to prevent false negatives
    out:
    while (tok = this.lookahead(i++)) {
      switch (tok.type) {
        case 'function':
        case '(':
          ++parens;
          break;
        case ')':
          if (!--parens) break out;
          break;
        case 'eos':
          this.error('failed to find closing paren ")"');
      }
    }
    
    // Definition or call
    switch (this.currentState()) {
      case 'expression':
        return this.functionCall();
      default:
        return this.looksLikeFunctionDefinition(i)
          ? this.functionDefinition()
          : this.expression();
    }
  },

  /**
   * url '(' (expression | urlchars)+ ')'
   */

  url: function() {
    this.expect('function');
    this.state.push('function arguments');
    var args = this.args();
    this.expect(')');
    this.state.pop();
    return new nodes.Call('url', args);
  },

  /**
   * ident '(' expression ')'
   */
  
  functionCall: function() {
    if ('url' == this.peek().val.name) return this.url();
    var name = this.expect('function').val.name;
    this.state.push('function arguments');
    this.parens++;
    var args = this.args();
    this.expect(')');
    this.parens--;
    this.state.pop();
    return new nodes.Call(name, args);
  },
  
  /**
   * ident '(' params ')' block
   */
  
  functionDefinition: function() {
    var name = this.expect('function').val.name;

    // params
    this.state.push('function params');
    this.skipWhitespace();
    var params = this.params();
    this.skipWhitespace();
    this.expect(')');
    this.state.pop();

    // Body
    this.state.push('function');
    var fn = new nodes.Function(name, params);
    fn.block = this.block(fn);
    this.state.pop();
    return new nodes.Ident(name, fn);
  },
  
  /**
   *   ident
   * | ident '...'
   * | ident '=' expression
   * | ident ',' ident
   */
  
  params: function() {
    var tok
      , node
      , params = new nodes.Params;
    while (tok = this.accept('ident')) {
      this.accept('space');
      params.push(node = tok.val);
      if (this.accept('...')) {
        node.rest = true;
      } else if (this.accept('=')) {
        node.val = this.expression();
      }
      this.skipWhitespace();
      this.accept(',');
      this.skipWhitespace();
    }
    return params;
  },
  
  /**
   * (ident ':')? expression (',' (ident ':')? expression)*
   */

  args: function() {
    var args = new nodes.Arguments
      , keyword;

    do {
      // keyword
      if ('ident' == this.peek().type && ':' == this.lookahead(2).type) {
        keyword = this.next().val.string;
        this.expect(':');
        args.map[keyword] = this.expression();
      // arg
      } else {
        args.push(this.expression());
      }
    } while (this.accept(','));

    return args;
  },
 
  /**
   * expression (',' expression)*
   */

  list: function() {
    var node = this.expression();
    while (this.accept(',')) {
      if (node.isList) {
        list.push(this.expression());
      } else {
        var list = new nodes.Expression(true);
        list.push(node);
        list.push(this.expression());
        node = list;
      }
    }
    return node;
  },
  
  /**
   * negation+
   */

  expression: function() {
    var node
      , expr = new nodes.Expression;
    this.state.push('expression');
    while (node = this.negation()) {
      if (!node) this.error('unexpected token {peek} in expression');
      expr.push(node);
    }
    this.state.pop();
    return expr;
  },
  
  /**
   *   'not' ternary
   * | ternary
   */
  
  negation: function() {
    if (this.accept('not')) {
      return new nodes.UnaryOp('!', this.negation());
    }
    return this.ternary();
  },
  
  /**
   * logical ('?' expression ':' expression)?
   */
  
  ternary: function() {
    var node = this.logical();
    if (this.accept('?')) {
      var trueExpr = this.expression();
      this.expect(':');
      var falseExpr = this.expression();
      node = new nodes.Ternary(node, trueExpr, falseExpr);
    }
    return node;
  },
  
  /**
   * typecheck (('&&' | '||') typecheck)*
   */
  
  logical: function() {
    var op
      , node = this.typecheck();
    while (op = this.accept('&&') || this.accept('||')) {
      node = new nodes.BinOp(op.type, node, this.typecheck());
    }
    return node;
  },
  
  /**
   * equality ('is a' equality)*
   */
  
  typecheck: function() {
    var op
      , node = this.equality();
    while (op = this.accept('is a')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.equality());
      this.operand = false;
    }
    return node;
  },
  
  /**
   * in (('==' | '!=') in)*
   */
  
  equality: function() {
    var op
      , node = this.in();
    while (op = this.accept('==') || this.accept('!=')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.in());
      this.operand = false;
    }
    return node;
  },

  /**
   * relational ('in' relational)*
   */

  in: function() {
    var node = this.relational();
    while (this.accept('in')) {
      this.operand = true;
      if (!node) this.error('illegal unary "in", missing left-hand operand');
      node = new nodes.BinOp('in', node, this.relational());
      this.operand = false;
    }
    return node;
  },
  
  /**
   * range (('>=' | '<=' | '>' | '<') range)*
   */
  
  relational: function() {
    var op
      , node = this.range();
    while (op = 
         this.accept('>=')
      || this.accept('<=')
      || this.accept('<')
      || this.accept('>')
      ) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.type, node, this.range());
      this.operand = false;
    }
    return node;
  },
  
  /**
   * additive (('..' | '...') additive)*
   */
  
  range: function() {
    var op
      , node = this.additive();
    if (op = this.accept('...') || this.accept('..')) {
      this.operand = true;
      if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
      node = new nodes.BinOp(op.val, node, this.additive());
      this.operand = false;
    }
    return node;
  },
  
  /**
   * multiplicative (('+' | '-') multiplicative)*
   */
  
  additive: function() {
    var op
      , node = this.multiplicative();
    while (op = this.accept('+') || this.accept('-')) {
      this.operand = true;
      node = new nodes.BinOp(op.type, node, this.multiplicative());
      this.operand = false;
    }
    return node;
  },
  
  /**
   * defined (('**' | '*' | '/' | '%') defined)*
   */
  
  multiplicative: function() {
    var op
      , node = this.defined();
    while (op =
         this.accept('**')
      || this.accept('*')
      || this.accept('/')
      || this.accept('%')) {
      this.operand = true;
      if ('/' == op && this.inProperty && !this.parens) {
        this.stash.push(new Token('literal', new nodes.Literal('/')));
        this.operand = false;
        return node;
      } else {
        if (!node) this.error('illegal unary "' + op + '", missing left-hand operand');
        node = new nodes.BinOp(op.type, node, this.defined());
        this.operand = false;
      }
    }
    return node;
  },
  
  /**
   *    unary 'is defined'
   *  | unary
   */
  
  defined: function() {
    var node = this.unary();
    if (this.accept('is defined')) {
      if (!node) this.error('illegal unary "is defined", missing left-hand operand');
      node = new nodes.BinOp('is defined', node);
    }
    return node;
  },
  
  /**
   *   ('!' | '~' | '+' | '-') unary
   * | subscript
   */
  
  unary: function() {
    var op
      , node;
    if (op =
         this.accept('!')
      || this.accept('~')
      || this.accept('+')
      || this.accept('-')) {
      this.operand = true;
      node = new nodes.UnaryOp(op.type, this.unary());
      this.operand = false;
      return node;
    }
    return this.subscript();
  },
  
  /**
   *   primary ('[' expression ']' '='?)+
   * | primary
   */
  
  subscript: function() {
    var node = this.primary();
    while (this.accept('[')) {
      node = new nodes.BinOp('[]', node, this.expression());
      this.expect(']');
      // TODO: TernaryOp :)
      if (this.accept('=')) {
        node.op += '=';
        node.val = this.expression();
      }
    }
    return node;
  },
  
  /**
   *   unit
   * | null
   * | color
   * | string
   * | ident
   * | boolean
   * | literal
   * | '(' expression ')' '%'?
   */

  primary: function() {
    var op
      , node;

    // Parenthesis
    if (this.accept('(')) {
      ++this.parens;
      var expr = this.expression();
      this.expect(')');
      --this.parens;
      if (this.accept('%')) expr.push(new nodes.Ident('%'));
      return expr;
    }

    // Primitive
    switch (this.peek().type) {
      case 'null':
      case 'unit':
      case 'color':
      case 'string':
      case 'literal':
      case 'boolean':
        return this.next().val;
      case 'ident':
        return this.ident();
      case 'function':
        return this.functionCall();
    }
  }
};

});

require.define("/lib/lexer.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Lexer
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Token = require('./token')
  , nodes = require('./nodes')
  , errors = require('./errors')
  , units = require('./units');

/**
 * Expose `Lexer`.
 */

exports = module.exports = Lexer;

/**
 * Operator aliases.
 */

var alias = {
    'and': '&&'
  , 'or': '||'
  , 'is': '=='
  , 'isnt': '!='
  , 'is not': '!='
  , ':=': '?='
};

/**
 * Units.
 */

units = units.join('|');

/**
 * Unit RegExp.
 */

var unit = new RegExp('^(-)?(\\d+\\.\\d+|\\d+|\\.\\d+)(' + units + ')?[ \\t]*');

/**
 * Initialize a new `Lexer` with the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @api private
 */

function Lexer(str, options) {
  options = options || {};
  this.stash = [];
  this.indentStack = [];
  this.indentRe = null;
  this.lineno = 1;

  function comment(str, val, offset, s) {
    var inComment = s.lastIndexOf('/*', offset) > s.lastIndexOf('*/', offset) || "//" == s.substr(0, 2);
    return inComment
      ? str
      : val;
  };

  this.str = str
    .replace(/\s+$/, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/\\ *\n/g, ' ')
    .replace(/([,:(]) *\n\s*/g, comment)
    .replace(/\s*\n *([,)])/g, comment);
};

/**
 * Lexer prototype.
 */

Lexer.prototype = {
  
  /**
   * Custom inspect.
   */
  
  inspect: function(){
    var tok
      , tmp = this.str
      , buf = [];
    while ('eos' != (tok = this.next()).type) {
      buf.push(tok.inspect());
    }
    this.str = tmp;
    this.prevIndents = 0;
    return buf.concat(tok.inspect()).join('\n');
  },

  /**
   * Lookahead `n` tokens.
   *
   * @param {Number} n
   * @return {Object}
   * @api private
   */
  
  lookahead: function(n){
    var fetch = n - this.stash.length;
    while (fetch-- > 0) this.stash.push(this.advance());
    return this.stash[--n];
  },
  
  /**
   * Consume the given `len`.
   *
   * @param {Number|Array} len
   * @api private
   */

  skip: function(len){
    this.str = this.str.substr(Array.isArray(len)
      ? len[0].length
      : len);
  },

  /**
   * Fetch next token including those stashed by peek.
   *
   * @return {Token}
   * @api private
   */

  next: function() {
    var tok = this.stashed() || this.advance();
    switch (tok.type) {
      case 'newline':
      case 'indent':
        ++this.lineno;
        break;
      case 'outdent':
        if ('outdent' != this.prev.type) ++this.lineno;
    }
    this.prev = tok;
    tok.lineno = this.lineno;
    return tok;
  },

  /**
   * Fetch next token.
   *
   * @return {Token}
   * @api private
   */

  advance: function() {
    return this.eos()
      || this.null()
      || this.sep()
      || this.keyword()
      || this.urlchars()
      || this.atrule()
      || this.scope()
      || this.extends()
      || this.media()
      || this.mozdocument()
      || this.comment()
      || this.newline()
      || this.escaped()
      || this.important()
      || this.literal()
      || this.function()
      || this.brace()
      || this.paren()
      || this.color()
      || this.string()
      || this.unit()
      || this.namedop()
      || this.boolean()
      || this.ident()
      || this.op()
      || this.space()
      || this.selector();
  },

  /**
   * Lookahead a single token.
   *
   * @return {Token}
   * @api private
   */
  
  peek: function() {
    return this.lookahead(1);
  },
  
  /**
   * Return the next possibly stashed token.
   *
   * @return {Token}
   * @api private
   */

  stashed: function() {
    return this.stash.shift();
  },

  /**
   * EOS | trailing outdents.
   */

  eos: function() {
    if (this.str.length) return;
    if (this.indentStack.length) {
      this.indentStack.shift();
      return new Token('outdent');
    } else {
      return new Token('eos');
    }
  },

  /**
   * url char
   */

  urlchars: function() {
    var captures;
    if (!this.isURL) return;
    if (captures = /^[\/:@.;?&=*!,<>#%0-9]+/.exec(this.str)) {
      this.skip(captures);
      return new Token('literal', new nodes.Literal(captures[0]));
    }
  },

  /**
   * ';' [ \t]*
   */

  sep: function() {
    var captures;
    if (captures = /^;[ \t]*/.exec(this.str)) {
      this.skip(captures);
      return new Token(';');
    }
  },
  
  /**
   * ' '+
   */

  space: function() {
    var captures;
    if (captures = /^([ \t]+)/.exec(this.str)) {
      this.skip(captures);
      return new Token('space');
    }
  },
  
  /**
   * '\\' . ' '*
   */
   
  escaped: function() {
    var captures;
    if (captures = /^\\(.)[ \t]*/.exec(this.str)) {
      var c = captures[1];
      this.skip(captures);
      return new Token('ident', new nodes.Literal(c));
    }
  },
  
  /**
   * '@css' ' '* '{' .* '}' ' '*
   */
  
  literal: function() {
    // HACK attack !!!
    var captures;
    if (captures = /^@css[ \t]*\{/.exec(this.str)) {
      this.skip(captures);
      var c
        , braces = 1
        , css = '';
      while (c = this.str[0]) {
        this.str = this.str.substr(1);
        switch (c) {
          case '{': ++braces; break;
          case '}': --braces; break;
        }
        css += c;
        if (!braces) break;
      }
      css = css.replace(/\s*}$/, '');
      return new Token('literal', new nodes.Literal(css));
    }
  },
  
  /**
   * '!important' ' '*
   */
  
  important: function() {
    var captures;
    if (captures = /^!important[ \t]*/.exec(this.str)) {
      this.skip(captures);
      return new Token('ident', new nodes.Literal('!important'));
    }
  },
  
  /**
   * '{' | '}'
   */
  
  brace: function() {
    var captures;
    if (captures = /^([{}])/.exec(this.str)) {
      this.skip(1);
      var brace = captures[1];
      return new Token(brace, brace);
    }
  },
  
  /**
   * '(' | ')' ' '*
   */
  
  paren: function() {
    var captures;
    if (captures = /^([()])([ \t]*)/.exec(this.str)) {
      var paren = captures[1];
      this.skip(captures);
      if (')' == paren) this.isURL = false;
      var tok = new Token(paren, paren);
      tok.space = captures[2];
      return tok;
    }
  },
  
  /**
   * 'null'
   */
  
  null: function() {
    var captures;
    if (captures = /^(null)\b[ \t]*/.exec(this.str)) {
      this.skip(captures);
      return new Token('null', nodes.null);
    }
  },
  
  /**
   *   'if'
   * | 'else'
   * | 'unless'
   * | 'return'
   * | 'for'
   * | 'in'
   */
  
  keyword: function() {
    var captures;
    if (captures = /^(return|if|else|unless|for|in)\b[ \t]*/.exec(this.str)) {
      var keyword = captures[1];
      this.skip(captures);
      return new Token(keyword, keyword);
    }
  },
  
  /**
   *   'not'
   * | 'and'
   * | 'or'
   * | 'is'
   * | 'is not'
   * | 'isnt'
   * | 'is a'
   * | 'is defined'
   */
  
  namedop: function() {
    var captures;
    if (captures = /^(not|and|or|is a|is defined|isnt|is not|is)(?!-)\b([ \t]*)/.exec(this.str)) {
      var op = captures[1];
      this.skip(captures);
      op = alias[op] || op;
      var tok = new Token(op, op);
      tok.space = captures[2];
      return tok;
    }
  },
  
  /**
   *   ','
   * | '+'
   * | '+='
   * | '-'
   * | '-='
   * | '*'
   * | '*='
   * | '/'
   * | '/='
   * | '%'
   * | '%='
   * | '**'
   * | '!'
   * | '&'
   * | '&&'
   * | '||'
   * | '>'
   * | '>='
   * | '<'
   * | '<='
   * | '='
   * | '=='
   * | '!='
   * | '!'
   * | '~'
   * | '?='
   * | ':='
   * | '?'
   * | ':'
   * | '['
   * | ']'
   * | '..'
   * | '...'
   */
  
  op: function() {
    var captures;
    if (captures = /^([.]{2,3}|&&|\|\||[!<>=?:]=|\*\*|[-+*\/%]=?|[,=?:!~<>&\[\]])([ \t]*)/.exec(this.str)) {
      var op = captures[1];
      this.skip(captures);
      op = alias[op] || op;
      var tok = new Token(op, op);
      tok.space = captures[2];
      this.isURL = false;
      return tok;
    }
  },

  /**
   * '@extends' ([^{\n]+)
   */
  
  extends: function() {
    var captures;
    if (captures = /^@extends?[ \t]*([^\/{\n;]+)/.exec(this.str)) {
      this.skip(captures);
      return new Token('extend', captures[1].trim());
    }
  },

  /**
   * '@media' ([^{\n]+)
   */
  
  media: function() {
    var captures;
    if (captures = /^@media[ \t]*(.+?)(?=\/\/|[\n{])/.exec(this.str)) {
      this.skip(captures);
      return new Token('media', captures[1].trim());
    }
  },

  /**
   * '@-moz-document' ([^{\n]+)
   */

  mozdocument: function() {
    var captures;
    if (captures = /^@-moz-document[ \t]*([^\/{\n]+)/.exec(this.str)) {
      this.skip(captures);
      return new Token('-moz-document', captures[1].trim());
    }
  },

  /**
   * '@scope' ([^{\n]+)
   */
  
  scope: function() {
    var captures;
    if (captures = /^@scope[ \t]*([^\/{\n]+)/.exec(this.str)) {
      this.skip(captures);
      return new Token('scope', captures[1].trim());
    }
  },

  /**
   * '@' ('import' | 'keyframes' | 'charset' | 'page' | 'font-face')
   */
  
  atrule: function() {
    var captures;
    if (captures = /^@(import|(?:-(\w+)-)?keyframes|charset|font-face|page)[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var vendor = captures[2]
        , type = captures[1];
      if (vendor) type = 'keyframes';
      return new Token(type, vendor);
    }
  },

  /**
   * '//' *
   */
  
  comment: function() {
    // Single line
    if ('/' == this.str[0] && '/' == this.str[1]) {
      var end = this.str.indexOf('\n');
      if (-1 == end) end = this.str.length;
      this.skip(end);
      return this.advance();
    }

    // Multi-line
    if ('/' == this.str[0] && '*' == this.str[1]) {
      var end = this.str.indexOf('*/');
      if (-1 == end) end = this.str.length;
      var str = this.str.substr(0, end + 2)
        , lines = str.split('\n').length - 1
        , suppress = true;
      this.lineno += lines;
      this.skip(end + 2);
      // output
      if ('!' == str[2]) {
        str = str.replace('*!', '*');
        suppress = false;
      }
      return new Token('comment', new nodes.Comment(str, suppress));
    }
  },

  /**
   * 'true' | 'false'
   */
  
  boolean: function() {
    var captures;
    if (captures = /^(true|false)\b([ \t]*)/.exec(this.str)) {
      var val = nodes.Boolean('true' == captures[1]);
      this.skip(captures);
      var tok = new Token('boolean', val);
      tok.space = captures[2];
      return tok;
    }
  },

  /**
   * -*[_a-zA-Z$] [-\w\d$]* '('
   */
  
  function: function() {
    var captures;
    if (captures = /^(-*[_a-zA-Z$][-\w\d$]*)\(([ \t]*)/.exec(this.str)) {
      var name = captures[1];
      this.skip(captures);
      this.isURL = 'url' == name;
      var tok = new Token('function', new nodes.Ident(name));
      tok.space = captures[2];
      return tok;
    } 
  },

  /**
   * -*[_a-zA-Z$] [-\w\d$]*
   */
  
  ident: function() {
    var captures;
    if (captures = /^(@)?(-*[_a-zA-Z$][-\w\d$]*)/.exec(this.str)) {
      var at = captures[1]
        , name = captures[2]
        , id = new nodes.Ident(name);
      this.skip(captures);
      id.property = !! at;
      return new Token('ident', id);
    }
  },
  
  /**
   * '\n' ' '+
   */

  newline: function() {
    var captures, re;

    // we have established the indentation regexp
    if (this.indentRe){
      captures = this.indentRe.exec(this.str);
    // figure out if we are using tabs or spaces
    } else {
      // try tabs
      re = /^\n([\t]*)[ \t]*/;
      captures = re.exec(this.str);

      // nope, try spaces
      if (captures && !captures[1].length) {
        re = /^\n([ \t]*)/;
        captures = re.exec(this.str);
      }

      // established
      if (captures && captures[1].length) this.indentRe = re;
    }


    if (captures) {
      var tok
        , indents = captures[1].length;

      this.skip(captures);
      if (this.str[0] === ' ' || this.str[0] === '\t') {
        throw new errors.SyntaxError('Invalid indentation. You can use tabs or spaces to indent, but not both.');
      }

      // Reset state
      this.isVariable = false;

      // Blank line
      if ('\n' == this.str[0]) {
        ++this.lineno;
        return this.advance();
      }

      // Outdent
      if (this.indentStack.length && indents < this.indentStack[0]) {
        while (this.indentStack.length && this.indentStack[0] > indents) {
          this.stash.push(new Token('outdent'));
          this.indentStack.shift();
        }
        tok = this.stash.pop();
      // Indent
      } else if (indents && indents != this.indentStack[0]) {
        this.indentStack.unshift(indents);
        tok = new Token('indent');
      // Newline
      } else {
        tok = new Token('newline');
      }

      return tok;
    }
  },

  /**
   * '-'? (digit+ | digit* '.' digit+) unit
   */

  unit: function() {
    var captures;
    if (captures = unit.exec(this.str)) {
      this.skip(captures);
      var n = parseFloat(captures[2]);
      if ('-' == captures[1]) n = -n;
      var node = new nodes.Unit(n, captures[3]);
      return new Token('unit', node);
    }
  },

  /**
   * '"' [^"]+ '"' | "'"" [^']+ "'"
   */

  string: function() {
    var captures;
    if (captures = /^("[^"]*"|'[^']*')[ \t]*/.exec(this.str)) {
      var str = captures[1]
        , quote = captures[0][0];
      this.skip(captures);
      str = str.slice(1,-1).replace(/\\n/g, '\n');
      return new Token('string', new nodes.String(str, quote));
    }
  },

  /**
   * #rrggbbaa | #rrggbb | #rgba | #rgb | #nn | #n
   */

  color: function() {
    return this.rrggbbaa()
      || this.rrggbb()
      || this.rgba()
      || this.rgb()
      || this.nn()
      || this.n()
  },

  /**
   * #n
   */
  
  n: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{1})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var n = parseInt(captures[1] + captures[1], 16)
        , color = new nodes.RGBA(n, n, n, 1);
      color.raw = captures[0];
      return new Token('color', color); 
    }
  },

  /**
   * #nn
   */
  
  nn: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{2})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var n = parseInt(captures[1], 16)
        , color = new nodes.RGBA(n, n, n, 1);
      color.raw = captures[0];
      return new Token('color', color); 
    }
  },

  /**
   * #rgb
   */
  
  rgb: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{3})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb[0] + rgb[0], 16)
        , g = parseInt(rgb[1] + rgb[1], 16)
        , b = parseInt(rgb[2] + rgb[2], 16)
        , color = new nodes.RGBA(r, g, b, 1);
      color.raw = captures[0];
      return new Token('color', color); 
    }
  },
  
  /**
   * #rgba
   */
  
  rgba: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{4})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb[0] + rgb[0], 16)
        , g = parseInt(rgb[1] + rgb[1], 16)
        , b = parseInt(rgb[2] + rgb[2], 16)
        , a = parseInt(rgb[3] + rgb[3], 16)
        , color = new nodes.RGBA(r, g, b, a/255);
      color.raw = captures[0];
      return new Token('color', color); 
    }
  },
  
  /**
   * #rrggbb
   */
  
  rrggbb: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{6})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb.substr(0, 2), 16)
        , g = parseInt(rgb.substr(2, 2), 16)
        , b = parseInt(rgb.substr(4, 2), 16)
        , color = new nodes.RGBA(r, g, b, 1);
      color.raw = captures[0];
      return new Token('color', color); 
    }
  },
  
  /**
   * #rrggbbaa
   */
  
  rrggbbaa: function() {
    var captures;
    if (captures = /^#([a-fA-F0-9]{8})[ \t]*/.exec(this.str)) {
      this.skip(captures);
      var rgb = captures[1]
        , r = parseInt(rgb.substr(0, 2), 16)
        , g = parseInt(rgb.substr(2, 2), 16)
        , b = parseInt(rgb.substr(4, 2), 16)
        , a = parseInt(rgb.substr(6, 2), 16)
        , color = new nodes.RGBA(r, g, b, a/255);
      color.raw = captures[0];
      return new Token('color', color); 
    }
  },
  
  /**
   * [^\n,;]+
   */
  
  selector: function() {
    var captures;
    if (captures = /^[^{\n,]+/.exec(this.str)) {
      var selector = captures[0];
      this.skip(captures);
      return new Token('selector', selector);
    }
  }
};

});

require.define("/lib/token.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Token
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var inspect = require('util').inspect;

/**
 * Initialize a new `Token` with the given `type` and `val`.
 *
 * @param {String} type
 * @param {Mixed} val
 * @api private
 */

var Token = exports = module.exports = function Token(type, val) {
  this.type = type;
  this.val = val;
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Token.prototype.inspect = function(){
  var val = ' ' + inspect(this.val);
  return '[Token:' + this.lineno + ' '
    + '\x1b[32m' + this.type + '\x1b[0m'
    + '\x1b[33m' + (this.val ? val : '') + '\x1b[0m'
    + ']';
};

/**
 * Return type or val.
 *
 * @return {String}
 * @api public
 */

Token.prototype.toString = function(){
  return (undefined === this.val
    ? this.type
    : this.val).toString();
};

});

require.define("util",function(require,module,exports,__dirname,__filename,process,global){var events = require('events');

exports.isArray = isArray;
exports.isDate = function(obj){return Object.prototype.toString.call(obj) === '[object Date]'};
exports.isRegExp = function(obj){return Object.prototype.toString.call(obj) === '[object RegExp]'};


exports.print = function () {};
exports.puts = function () {};
exports.debug = function() {};

exports.inspect = function(obj, showHidden, depth, colors) {
  var seen = [];

  var stylize = function(str, styleType) {
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    var styles =
        { 'bold' : [1, 22],
          'italic' : [3, 23],
          'underline' : [4, 24],
          'inverse' : [7, 27],
          'white' : [37, 39],
          'grey' : [90, 39],
          'black' : [30, 39],
          'blue' : [34, 39],
          'cyan' : [36, 39],
          'green' : [32, 39],
          'magenta' : [35, 39],
          'red' : [31, 39],
          'yellow' : [33, 39] };

    var style =
        { 'special': 'cyan',
          'number': 'blue',
          'boolean': 'yellow',
          'undefined': 'grey',
          'null': 'bold',
          'string': 'green',
          'date': 'magenta',
          // "name": intentionally not styling
          'regexp': 'red' }[styleType];

    if (style) {
      return '\033[' + styles[style][0] + 'm' + str +
             '\033[' + styles[style][1] + 'm';
    } else {
      return str;
    }
  };
  if (! colors) {
    stylize = function(str, styleType) { return str; };
  }

  function format(value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (value && typeof value.inspect === 'function' &&
        // Filter out the util module, it's inspect function is special
        value !== exports &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      return value.inspect(recurseTimes);
    }

    // Primitive types cannot have properties
    switch (typeof value) {
      case 'undefined':
        return stylize('undefined', 'undefined');

      case 'string':
        var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                                 .replace(/'/g, "\\'")
                                                 .replace(/\\"/g, '"') + '\'';
        return stylize(simple, 'string');

      case 'number':
        return stylize('' + value, 'number');

      case 'boolean':
        return stylize('' + value, 'boolean');
    }
    // For some reason typeof null is "object", so special case here.
    if (value === null) {
      return stylize('null', 'null');
    }

    // Look up the keys of the object.
    var visible_keys = Object_keys(value);
    var keys = showHidden ? Object_getOwnPropertyNames(value) : visible_keys;

    // Functions without properties can be shortcutted.
    if (typeof value === 'function' && keys.length === 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        var name = value.name ? ': ' + value.name : '';
        return stylize('[Function' + name + ']', 'special');
      }
    }

    // Dates without properties can be shortcutted
    if (isDate(value) && keys.length === 0) {
      return stylize(value.toUTCString(), 'date');
    }

    var base, type, braces;
    // Determine the object type
    if (isArray(value)) {
      type = 'Array';
      braces = ['[', ']'];
    } else {
      type = 'Object';
      braces = ['{', '}'];
    }

    // Make functions say that they are functions
    if (typeof value === 'function') {
      var n = value.name ? ': ' + value.name : '';
      base = (isRegExp(value)) ? ' ' + value : ' [Function' + n + ']';
    } else {
      base = '';
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + value.toUTCString();
    }

    if (keys.length === 0) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return stylize('' + value, 'regexp');
      } else {
        return stylize('[Object]', 'special');
      }
    }

    seen.push(value);

    var output = keys.map(function(key) {
      var name, str;
      if (value.__lookupGetter__) {
        if (value.__lookupGetter__(key)) {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Getter/Setter]', 'special');
          } else {
            str = stylize('[Getter]', 'special');
          }
        } else {
          if (value.__lookupSetter__(key)) {
            str = stylize('[Setter]', 'special');
          }
        }
      }
      if (visible_keys.indexOf(key) < 0) {
        name = '[' + key + ']';
      }
      if (!str) {
        if (seen.indexOf(value[key]) < 0) {
          if (recurseTimes === null) {
            str = format(value[key]);
          } else {
            str = format(value[key], recurseTimes - 1);
          }
          if (str.indexOf('\n') > -1) {
            if (isArray(value)) {
              str = str.split('\n').map(function(line) {
                return '  ' + line;
              }).join('\n').substr(2);
            } else {
              str = '\n' + str.split('\n').map(function(line) {
                return '   ' + line;
              }).join('\n');
            }
          }
        } else {
          str = stylize('[Circular]', 'special');
        }
      }
      if (typeof name === 'undefined') {
        if (type === 'Array' && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify('' + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.substr(1, name.length - 2);
          name = stylize(name, 'name');
        } else {
          name = name.replace(/'/g, "\\'")
                     .replace(/\\"/g, '"')
                     .replace(/(^"|"$)/g, "'");
          name = stylize(name, 'string');
        }
      }

      return name + ': ' + str;
    });

    seen.pop();

    var numLinesEst = 0;
    var length = output.reduce(function(prev, cur) {
      numLinesEst++;
      if (cur.indexOf('\n') >= 0) numLinesEst++;
      return prev + cur.length + 1;
    }, 0);

    if (length > 50) {
      output = braces[0] +
               (base === '' ? '' : base + '\n ') +
               ' ' +
               output.join(',\n  ') +
               ' ' +
               braces[1];

    } else {
      output = braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
    }

    return output;
  }
  return format(obj, (typeof depth === 'undefined' ? 2 : depth));
};


function isArray(ar) {
  return ar instanceof Array ||
         Array.isArray(ar) ||
         (ar && ar !== Object.prototype && isArray(ar.__proto__));
}


function isRegExp(re) {
  return re instanceof RegExp ||
    (typeof re === 'object' && Object.prototype.toString.call(re) === '[object RegExp]');
}


function isDate(d) {
  if (d instanceof Date) return true;
  if (typeof d !== 'object') return false;
  var properties = Date.prototype && Object_getOwnPropertyNames(Date.prototype);
  var proto = d.__proto__ && Object_getOwnPropertyNames(d.__proto__);
  return JSON.stringify(proto) === JSON.stringify(properties);
}

function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}

exports.log = function (msg) {};

exports.pump = null;

var Object_keys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

var Object_getOwnPropertyNames = Object.getOwnPropertyNames || function (obj) {
    var res = [];
    for (var key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) res.push(key);
    }
    return res;
};

var Object_create = Object.create || function (prototype, properties) {
    // from es5-shim
    var object;
    if (prototype === null) {
        object = { '__proto__' : null };
    }
    else {
        if (typeof prototype !== 'object') {
            throw new TypeError(
                'typeof prototype[' + (typeof prototype) + '] != \'object\''
            );
        }
        var Type = function () {};
        Type.prototype = prototype;
        object = new Type();
        object.__proto__ = prototype;
    }
    if (typeof properties !== 'undefined' && Object.defineProperties) {
        Object.defineProperties(object, properties);
    }
    return object;
};

exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object_create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (typeof f !== 'string') {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(exports.inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j': return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });
  for(var x = args[i]; i < len; x = args[++i]){
    if (x === null || typeof x !== 'object') {
      str += ' ' + x;
    } else {
      str += ' ' + exports.inspect(x);
    }
  }
  return str;
};

});

require.define("events",function(require,module,exports,__dirname,__filename,process,global){if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    }
;
function indexOf (xs, x) {
    if (xs.indexOf) return xs.indexOf(x);
    for (var i = 0; i < xs.length; i++) {
        if (x === xs[i]) return i;
    }
    return -1;
}

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!this._events) this._events = {};
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = indexOf(list, listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};

});

require.define("/lib/nodes/index.js",function(require,module,exports,__dirname,__filename,process,global){
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
exports.MozDocument = require('./mozdocument');

/**
 * Singletons.
 */

exports.true = new exports.Boolean(true);
exports.false = new exports.Boolean(false);
exports.null = new exports.Null;

});

require.define("/lib/nodes/node.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Node
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Evaluator = require('../visitor/evaluator')
  , utils = require('../utils')
  , nodes = require('./');

/**
 * Node constructor.
 *
 * @api public
 */

var Node = module.exports = function Node(){
  this.lineno = nodes.lineno;
  Object.defineProperty(this, 'filename', { writable: true, value: nodes.filename });
};

/**
 * Return this node.
 *
 * @return {Node}
 * @api public
 */

Node.prototype.__defineGetter__('first', function(){
  return this;
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Node.prototype.__defineGetter__('hash', function(){
  return this.val;
});

/**
 * Return node name.
 *
 * @return {String}
 * @api public
 */

Node.prototype.__defineGetter__('nodeName', function(){
  return this.constructor.name.toLowerCase();
});

/**
 * Return this node.
 * 
 * @return {Node}
 * @api public
 */

Node.prototype.clone = function(){
  return this;
};

/**
 * Nodes by default evaluate to themselves.
 *
 * @return {Node}
 * @api public
 */

Node.prototype.eval = function(){
  return new Evaluator(this).evaluate();
};

/**
 * Return true.
 *
 * @return {Boolean}
 * @api public
 */

Node.prototype.toBoolean = function(){
  return nodes.true;
};

/**
 * Return the expression, or wrap this node in an expression.
 *
 * @return {Expression}
 * @api public
 */

Node.prototype.toExpression = function(){
  if ('expression' == this.nodeName) return this;
  var expr = new nodes.Expression;
  expr.push(this);
  return expr;
};

/**
 * Return false if `op` is generally not coerced.
 *
 * @param {String} op
 * @return {Boolean}
 * @api private
 */

Node.prototype.shouldCoerce = function(op){
  switch (op) {
    case 'is a':
    case 'in':
    case '||':
    case '&&':
      return false;
    default:
      return true;
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Node.prototype.operate = function(op, right){
  switch (op) {
    case 'is a':
      if ('string' == right.nodeName) {
        return nodes.Boolean(this.nodeName == right.val);
      } else {
        throw new Error('"is a" expects a string, got ' + right.toString());
      }
    case '==':
      return nodes.Boolean(this.hash == right.hash);
    case '!=':
      return nodes.Boolean(this.hash != right.hash);
    case '>=':
      return nodes.Boolean(this.hash >= right.hash);
    case '<=':
      return nodes.Boolean(this.hash <= right.hash);
    case '>':
      return nodes.Boolean(this.hash > right.hash);
    case '<':
      return nodes.Boolean(this.hash < right.hash);
    case '||':
      return this.toBoolean().isTrue
        ? this
        : right;
    case 'in':
      var vals = utils.unwrap(right).nodes
        , hash = this.hash;
      if (!vals) throw new Error('"in" given invalid right-hand operand, expecting an expression');
      for (var i = 0, len = vals.length; i < len; ++i) {
        if (hash == vals[i].hash) {
          return nodes.true;
        }
      }
      return nodes.false;
    case '&&':
      var a = this.toBoolean()
        , b = right.toBoolean();
      return a.isTrue && b.isTrue
        ? right
        : a.isFalse
          ? this
          : right;
    default:
      if ('[]' == op) {
        var msg = 'cannot perform '
          + this
          + '[' + right + ']';
      } else {
        var msg = 'cannot perform'
          + ' ' + this
          + ' ' + op
          + ' ' + right;
      }
      throw new Error(msg);
  }
};

/**
 * Initialize a new `CoercionError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function CoercionError(msg) {
  this.name = 'CoercionError'
  this.message = msg
  Error.captureStackTrace(this, CoercionError);
}

/**
 * Inherit from `Error.prototype`.
 */

CoercionError.prototype.__proto__ = Error.prototype;

/**
 * Default coercion throws.
 *
 * @param {Node} other
 * @return {Node}
 * @api public
 */

Node.prototype.coerce = function(other){
  if (other.nodeName == this.nodeName) return other;
  throw new CoercionError('cannot coerce ' + other + ' to ' + this.nodeName);
};

});

require.define("/lib/visitor/evaluator.js",function(require,module,exports,__dirname,__filename,process,global){
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
  this.includeCSS = options['include css'];
  this.paths.push(dirname(options.filename || '.'));
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
Evaluator.prototype.visit = function(node){
  try {
    return visit.call(this, node);
  } catch (err) {
    if (err.filename) throw err;
    err.lineno = node.lineno;
    err.filename = node.filename;
    err.stylusStack = this.stack.toString();
    try {
      err.input = fs.readFileSync(err.filename, 'utf8');
    } catch (err) {
      // ignore
    }
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
 * Evaluate the tree.
 *
 * @return {Node}
 * @api private
 */

Evaluator.prototype.evaluate = function(){
  debug('eval %s', this.filename);
  this.setup();
  return this.visit(this.root);
};

/**
 * Visit Group.
 */

Evaluator.prototype.visitGroup = function(group){
  group.nodes = group.nodes.map(function(selector){
    selector.val = this.interpolate(selector);
    debug('ruleset %s', selector.val);
    return selector;
  }, this);

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
  var query = this.lookup(media.val);
  if (query) media.val = new nodes.Literal(query.first.string);
  return media;
};

/**
 * Visit MozDocument.
 */

Evaluator.prototype.visitMozDocument = function(mozdocument){
  mozdocument.block = this.visit(mozdocument.block);
  return mozdocument;
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
  var args = this.visit(call.args)
    , mapCopy = {};

  for (var key in args.map) {
    mapCopy[key] = args.map[key];
    args.map[key] = this.visit(mapCopy[key].clone());
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

  // restore kwargs
  for (key in mapCopy) {
    args.map[key] = mapCopy[key];
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
  for (block.index = 0; block.index < block.nodes.length; ++block.index) {
    try {
      block.nodes[block.index] = this.visit(block.nodes[block.index]);
    } catch (err) {
      if ('return' == err.nodeName) {
        if (this.return) {
          this.stack.pop();
          throw err;
        } else {
          block.nodes[block.index] = err;
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
    , block = this.currentBlock
    , negate = node.negate;

  this.return++;
  var ok = this.visit(node.cond).first.toBoolean();
  this.return--;

  // Evaluate body
  if (negate) {
    // unless
    if (ok.isFalse) {
      ret = this.visit(node.block);
    }
  } else {
    // if
    if (ok.isTrue) {
      ret = this.visit(node.block);
    // else
    } else if (node.elses.length) {
      var elses = node.elses
        , len = elses.length;
      for (var i = 0; i < len; ++i) {
        // else if
        if (elses[i].cond) {
          if (this.visit(elses[i].cond).first.toBoolean().isTrue) {
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
 * Visit Extend.
 */

Evaluator.prototype.visitExtend = function(extend){
  var selector = extend.selector;
  var block = !this.currentBlock.node.extends && this.targetBlock.node.extends ? this.targetBlock : this.currentBlock;
  block.node.extends.push(selector);
  return nodes.null;
};

/**
 * Visit Import.
 */

Evaluator.prototype.visitImport = function(imported){
  this.return++;

  var root = this.root
    , Parser = require('../parser')
    , path = this.visit(imported.path).first
    , includeCSS = this.includeCSS
    , importStack = this.importStack
    , found
    , literal;

  this.return--;
  debug('import %s', path);

  // url() passed
  if ('url' == path.name) return imported;

  // Enusre string
  if (!path.string) throw new Error('@import string expected');
  var name = path = path.string;

  // Literal
  if (~path.indexOf('.css') && !~path.indexOf('.css.')) {
    literal = true;
    if (!includeCSS) return imported;
  }

  // support optional .styl
  if (!literal && !/\.styl$/i.test(path)) path += '.styl';

  // Lookup
  found = utils.lookup(path, this.paths, this.filename);
  found = found || utils.lookup(join(name, 'index.styl'), this.paths, this.filename);

  // Expose imports
  imported.path = found;
  imported.dirname = dirname(found);
  this.paths.push(imported.dirname);

  // Nested imports
  if (importStack.length) this.paths.push(dirname(importStack[importStack.length - 1]));

  if (this.options._imports) this.options._imports.push(imported);

  // Throw if import failed
  //if (!found) throw new Error('failed to locate @import file ' + path);

  // Parse the file
  importStack.push(found);
  nodes.filename = found;

  // UPDATE FOR BROWSER
  //var str = fs.readFileSync(found, 'utf8');
  var str = ""
  // END
  if (literal) return new nodes.Literal(str.replace(/\r\n?/g, "\n"));

  // parse
  var block = new nodes.Block
    , parser = new Parser(str, utils.merge({ root: block }, this.options));

  try {
    block = parser.parse();
  } catch (err) {
    err.filename = found;
    err.lineno = parser.lexer.lineno;
    err.input = str;
    throw err;
  }

  // Store the modified time
  // UPDATE FOR BROWSER
  //fs.stat(found, function(err, stat){
  //  if (err) return;
  //  imported.mtime = stat.mtime;
  //});
  // END

  // Evaluate imported "root"
  block.parent = root;
  block.scope = false;
  var ret = this.visit(block);
  this.paths.pop();
  importStack.pop();

  return ret;
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
    if (targetFrame) this.targetBlock = targetFrame.block;
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
        case 'media':
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

  if (node.segments) {
    return node.segments.map(toString).join('');
  } else {
    return toString(node);
  }
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

});

require.define("/lib/visitor/index.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Visitor
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Visitor` with the given `root` Node.
 *
 * @param {Node} root
 * @api private
 */

var Visitor = module.exports = function Visitor(root) {
  this.root = root;
};

/**
 * Visit the given `node`.
 *
 * @param {Node|Array} node
 * @api public
 */

Visitor.prototype.visit = function(node, fn){
  var method = 'visit' + node.constructor.name;
  if (this[method]) return this[method](node);
  return node;
};


});

require.define("/lib/units.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - units
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

// units found in http://www.w3.org/TR/css3-values

module.exports = [
    'em', 'ex', 'ch', 'rem' // relative lengths
  , 'vw', 'vh', 'vmin' // relative viewport-percentage lengths
  , 'cm', 'mm', 'in', 'pt', 'pc', 'px' // absolute lengths
  , 'deg', 'grad', 'rad', 'turn' // angles
  , 's', 'ms' // times
  , 'Hz', 'kHz' // frequencies
  , 'dpi', 'dpcm', 'dppx', 'x' // resolutions
  , '%' // percentage type
  , 'fr' // grid-layout (http://www.w3.org/TR/css3-grid-layout/)
];

});

require.define("/lib/stack/index.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Stack
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Frame = require('./frame');

/**
 * Initialize a new `Stack`.
 *
 * @api private
 */

var Stack = module.exports = function Stack() {
  Array.apply(this, arguments);
};

/**
 * Inherit from `Array.prototype`.
 */

Stack.prototype.__proto__ = Array.prototype;

/**
 * Push the given `frame`.
 *
 * @param {Frame} frame
 * @api public
 */

Stack.prototype.push = function(frame){
  frame.stack = this;
  frame.parent = this.currentFrame;
  return [].push.apply(this, arguments);
};

/**
 * Return the current stack `Frame`.
 *
 * @return {Frame}
 * @api private
 */

Stack.prototype.__defineGetter__('currentFrame', function(){
  return this[this.length - 1];
});

/**
 * Lookup stack frame for the given `block`.
 *
 * @param {Block} block
 * @return {Frame}
 * @api private
 */

Stack.prototype.getBlockFrame = function(block){
  for (var i = 0; i < this.length; ++i) {
    if (block == this[i].block) {
      return this[i];
    }
  }
};

/**
 * Lookup the given local variable `name`, relative
 * to the lexical scope of the current frame's `Block`.
 *
 * When the result of a lookup is an identifier
 * a recursive lookup is performed, defaulting to
 * returning the identifier itself.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Stack.prototype.lookup = function(name){
  var block = this.currentFrame.block
    , val
    , ret;

  do {
    var frame = this.getBlockFrame(block);
    if (frame && (val = frame.lookup(name))) {
      switch (val.first.nodeName) {
        case 'ident':
          return this.lookup(val.first.name) || val;
        default:
          return val;
      }
    }
  } while (block = block.parent);
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api private
 */

Stack.prototype.inspect = function(){
  return this.reverse().map(function(frame){
    return frame.inspect();
  }).join('\n');
};

/**
 * Return stack string formatted as:
 *
 *   at <context> (<filename>:<lineno>)
 *
 * @return {String}
 * @api private
 */

Stack.prototype.toString = function(){
  var block
    , node
    , buf = []
    , location
    , len = this.length;

  while (len--) {
    block = this[len].block;
    if (node = block.node) {
      location = '(' + node.filename + ':' + (node.lineno + 1) + ')';
      switch (node.nodeName) {
        case 'function':
          buf.push('    at ' + node.name + '() ' + location);
          break;
        case 'group':
          buf.push('    at "' + node.nodes[0].val + '" ' + location);
          break;
      }
    }
  }

  return buf.join('\n');
};
});

require.define("/lib/stack/frame.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - stack - Frame
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Scope = require('./scope')
  , blocks = require('../nodes');

/**
 * Initialize a new `Frame` with the given `block`.
 *
 * @param {Block} block
 * @api private
 */

var Frame = module.exports = function Frame(block) {
  this._scope = false === block.scope
    ? null
    : new Scope;
  this.block = block;
};

/**
 * Return this frame's scope or the parent scope
 * for scope-less blocks.
 *
 * @return {Scope}
 * @api public
 */

Frame.prototype.__defineGetter__('scope', function(){
  return this._scope || this.parent.scope;
});

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Frame.prototype.lookup = function(name){
  return this.scope.lookup(name)
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Frame.prototype.inspect = function(){
  return '[Frame '
    + (false === this.block.scope
        ? 'scope-less'
        : this.scope.inspect())
    + ']';
};

});

require.define("/lib/stack/scope.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - stack - Scope
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Initialize a new `Scope`.
 *
 * @api private
 */

var Scope = module.exports = function Scope() {
  this.locals = {};
};

/**
 * Add `ident` node to the current scope.
 *
 * @param {Ident} ident
 * @api private
 */

Scope.prototype.add = function(ident){
  this.locals[ident.name] = ident.val;
};

/**
 * Lookup the given local variable `name`.
 *
 * @param {String} name
 * @return {Node}
 * @api private
 */

Scope.prototype.lookup = function(name){
  return this.locals[name];
};

/**
 * Custom inspect.
 *
 * @return {String}
 * @api public
 */

Scope.prototype.inspect = function(){
  var keys = Object.keys(this.locals).map(function(key){ return '@' + key; });
  return '[Scope'
    + (keys.length ? ' ' + keys.join(', ') : '')
    + ']';
};

});

require.define("/lib/utils.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - utils
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var nodes = require('./nodes')
  , join = require('path').join
  , fs = require('fs');

/**
 * Check if `path` looks absolute.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

exports.absolute = function(path){
  return /^([a-z]:\\)|\//i.test(path);
};

/**
 * Attempt to lookup `path` within `paths` from tail to head.
 * Optionally a path to `ignore` may be passed.
 *
 * @param {String} path
 * @param {String} paths
 * @param {String} ignore
 * @return {String}
 * @api private
 */

exports.lookup = function(path, paths, ignore){
  var lookup
    , i = paths.length;

  // Absolute
  if (exports.absolute(path)) {
    try {
      fs.statSync(path);
      return path;
    } catch (err) {
      // Ignore, continue on
      // to trying relative lookup.
      // Needed for url(/images/foo.png)
      // for example
    }
  }

  // Relative
  while (i--) {
    try {
      lookup = join(paths[i], path);
      if (ignore == lookup) continue;
      fs.statSync(lookup);
      return lookup;
    } catch (err) {
      // Ignore
    }
  }
};

/**
 * Format the given `err` with the given `options`.
 *
 * Options:
 *
 *   - `filename`   context filename
 *   - `context`    context line count [8]
 *   - `lineno`     context line number
 *   - `input`        input string
 *
 * @param {Error} err
 * @param {Object} options
 * @return {Error}
 * @api private
 */

exports.formatException = function(err, options){
  var lineno = options.lineno
    , filename = options.filename
    , str = options.input
    , context = options.context || 8
    , context = context / 2
    , lines = ('\n' + str).split('\n')
    , start = Math.max(lineno - context, 1)
    , end = Math.min(lines.length, lineno + context)
    , pad = end.toString().length;

  var context = lines.slice(start, end).map(function(line, i){
    var curr = i + start;
    return (curr == lineno ? ' > ' : '   ')
      + Array(pad - curr.toString().length + 1).join(' ')
      + curr
      + '| '
      + line;
  }).join('\n');

  err.message = filename
    + ':' + lineno
    + '\n' + context
    + '\n\n' + err.message + '\n'
    + (err.stylusStack ? err.stylusStack + '\n' : '');

  return err;
};

/**
 * Assert that `node` is of the given `type`, or throw.
 *
 * @param {Node} node
 * @param {Function} type
 * @param {String} param
 * @api public
 */

exports.assertType = function(node, type, param){
  exports.assertPresent(node, param);
  if (node.nodeName == type) return;
  var actual = node.nodeName
    , msg = 'expected "'
      + param + '" to be a '
      + type + ', but got '
      + actual + ':' + node;
  throw new Error('TypeError: ' + msg);
};

/**
 * Assert that `node` is a `String` or `Ident`.
 *
 * @param {Node} node
 * @param {String} param
 * @api public
 */

exports.assertString = function(node, param){
  exports.assertPresent(node, param);
  switch (node.nodeName) {
    case 'string':
    case 'ident':
    case 'literal':
      return;
    default:
      var actual = node.nodeName
        , msg = 'expected string, ident or literal, but got ' + actual + ':' + node;
      throw new Error('TypeError: ' + msg);
  }
};

/**
 * Assert that `node` is a `RGBA` or `HSLA`.
 *
 * @param {Node} node
 * @param {String} param
 * @api public
 */

exports.assertColor = function(node, param){
  exports.assertPresent(node, param);
  switch (node.nodeName) {
    case 'rgba':
    case 'hsla':
      return;
    default:
      var actual = node.nodeName
        , msg = 'expected rgba or hsla, but got ' + actual + ':' + node;
      throw new Error('TypeError: ' + msg);
  }
};

/**
 * Assert that param `name` is given, aka the `node` is passed.
 *
 * @param {Node} node
 * @param {String} name
 * @api public
 */

exports.assertPresent = function(node, name){
  if (node) return;
  if (name) throw new Error('"' + name + '" argument required');
  throw new Error('argument missing');
};

/**
 * Unwrap `expr`.
 *
 * Takes an expressions with length of 1
 * such as `((1 2 3))` and unwraps it to `(1 2 3)`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

exports.unwrap = function(expr){
  // explicitly preserve the expression
  if (expr.preserve) return expr;
  if ('arguments' != expr.nodeName && 'expression' != expr.nodeName) return expr;
  if (1 != expr.nodes.length) return expr;
  if ('arguments' != expr.nodes[0].nodeName && 'expression' != expr.nodes[0].nodeName) return expr;
  return exports.unwrap(expr.nodes[0]);
};

/**
 * Coerce JavaScript values to their Stylus equivalents.
 *
 * @param {Mixed} val
 * @return {Node}
 * @api public
 */

exports.coerce = function(val){
  switch (typeof val) {
    case 'function':
      return val;
    case 'string':
      return new nodes.String(val);
    case 'boolean':
      return new nodes.Boolean(val);
    case 'number':
      return new nodes.Unit(val);
    default:
      if (null == val) return nodes.null;
      if (Array.isArray(val)) return exports.coerceArray(val);
      if (val.nodeName) return val;
      return exports.coerceObject(val);
  }
};

/**
 * Coerce a javascript `Array` to a Stylus `Expression`.
 *
 * @param {Array} val
 * @return {Expression}
 * @api private
 */

exports.coerceArray = function(val){
  var expr = new nodes.Expression;
  val.forEach(function(val){
    expr.push(exports.coerce(val));
  });
  return expr;
};

/**
 * Coerce a javascript object to a Stylus `Expression`.
 *
 * For example `{ foo: 'bar', bar: 'baz' }` would become
 * the expression `(foo 'bar') (bar 'baz')`.
 *
 * @param {Object} obj
 * @return {Expression}
 * @api public
 */

exports.coerceObject = function(obj){
  var expr = new nodes.Expression
    , val;

  for (var key in obj) {
    val = exports.coerce(obj[key]);
    key = new nodes.Ident(key);
    expr.push(exports.coerceArray([key, val]));
  }

  return expr;
};

/**
 * Return param names for `fn`.
 *
 * @param {Function} fn
 * @return {Array}
 * @api private
 */

exports.params = function(fn){
  return fn
    .toString()
    .match(/\(([^)]*)\)/)[1].split(/ *, */);
};

/**
 * Merge object `b` with `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function(a, b){
  for (var k in b) a[k] = b[k];
  return a;
}

});

require.define("fs",function(require,module,exports,__dirname,__filename,process,global){// nothing to see here... no file methods for the browser

});

require.define("/lib/functions/index.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Evaluator - built-in functions
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Compiler = require('../visitor/compiler')
  , nodes = require('../nodes')
  , utils = require('../utils')
  , Image = require('./image')
  , units = require('../units')
  , path = require('path')
  , fs = require('fs');

/**
 * Color component name map.
 */

var componentMap = {
    red: 'r'
  , green: 'g'
  , blue: 'b'
  , alpha: 'a'
  , hue: 'h'
  , saturation: 's'
  , lightness: 'l'
};

/**
 * Color component unit type map.
 */

var unitMap = {
    hue: 'deg'
  , saturation: '%'
  , lightness: '%'
};

/**
 * Color type map.
 */

var typeMap = {
    red: 'rgba'
  , blue: 'rgba'
  , green: 'rgba'
  , alpha: 'rgba'
  , hue: 'hsla'
  , saturation: 'hsla'
  , lightness: 'hsla'
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l,a component values.
 *
 * Examples:
 *
 *    hsla(10deg, 50%, 30%, 0.5)
 *    // => HSLA
 *
 *    hsla(#ffcc00)
 *    // => HSLA
 *
 * @param {RGBA|HSLA|Unit} hue
 * @param {Unit} saturation
 * @param {Unit} lightness
 * @param {Unit} alpha
 * @return {HSLA}
 * @api public
 */

exports.hsla = function hsla(hue, saturation, lightness, alpha){
  switch (arguments.length) {
    case 1:
      utils.assertColor(hue);
      return hue.hsla;
    default:
      utils.assertType(hue, 'unit', 'hue');
      utils.assertType(saturation, 'unit', 'saturation');
      utils.assertType(lightness, 'unit', 'lightness');
      utils.assertType(alpha, 'unit', 'alpha');
      if (alpha && '%' == alpha.type) alpha.val /= 100;
      return new nodes.HSLA(
          hue.val
        , saturation.val
        , lightness.val
        , alpha.val);
  }
};

/**
 * Convert the given `color` to an `HSLA` node,
 * or h,s,l component values.
 *
 * Examples:
 *
 *    hsl(10, 50, 30)
 *    // => HSLA
 *
 *    hsl(#ffcc00)
 *    // => HSLA
 *
 * @param {Unit|HSLA|RGBA} hue
 * @param {Unit} saturation
 * @param {Unit} lightness
 * @return {HSLA}
 * @api public
 */

exports.hsl = function hsl(hue, saturation, lightness){
  if (1 == arguments.length) {
    utils.assertColor(hue, 'color');
    return hue.hsla;
  } else {
    return exports.hsla(
        hue
      , saturation
      , lightness
      , new nodes.Unit(1));
  }
};

/**
 * Return type of `node`.
 *
 * Examples:
 * 
 *    type(12)
 *    // => 'unit'
 *
 *    type(#fff)
 *    // => 'color'
 *
 *    type(type)
 *    // => 'function'
 *
 *    type(unbound)
 *    typeof(unbound)
 *    type-of(unbound)
 *    // => 'ident'
 *
 * @param {Node} node
 * @return {String}
 * @api public
 */

exports.type =
exports.typeof =
exports['type-of'] = function type(node){
  utils.assertPresent(node, 'expression');
  return node.nodeName;
};

/**
 * Return component `name` for the given `color`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} na,e
 * @return {Unit}
 * @api public
 */

exports.component = function component(color, name) {
  utils.assertColor(color, 'color');
  utils.assertString(name, 'name');
  var name = name.string
    , unit = unitMap[name]
    , type = typeMap[name]
    , name = componentMap[name];
  if (!name) throw new Error('invalid color component "' + name + '"');
  return new nodes.Unit(color[type][name], unit);
};

/**
 * Return the basename of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.basename = function basename(p, ext){
  utils.assertString(p, 'path');
  return path.basename(p.val, ext && ext.val);
};

/**
 * Return the dirname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.dirname = function dirname(p){
  utils.assertString(p, 'path');
  return path.dirname(p.val);
};

/**
 * Return the extname of `path`.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

exports.extname = function extname(p){
  utils.assertString(p, 'path');
  return path.extname(p.val);
};

/**
 * Peform a path join.
 *
 * @param {String} path
 * @return {String}
 * @api public
 */

(exports.pathjoin = function pathjoin(){
  var paths = [].slice.call(arguments).map(function(path){
    return path.first.string;
  });
  return path.join.apply(null, paths);
}).raw = true;

/**
 * Return the red component of the given `color`.
 *
 * Examples:
 *
 *    red(#c00)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.red = function red(color){
  return exports.component(color, new nodes.String('red'));
};

/**
 * Return the green component of the given `color`.
 *
 * Examples:
 *
 *    green(#0c0)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.green = function green(color){
  return exports.component(color, new nodes.String('green'));
};

/**
 * Return the blue component of the given `color`.
 *
 * Examples:
 *
 *    blue(#00c)
 *    // => 204
 *
 * @param {RGBA|HSLA} color
 * @return {Unit}
 * @api public
 */

exports.blue = function blue(color){
  return exports.component(color, new nodes.String('blue'));
};

/**
 * Return a `RGBA` from the r,g,b,a channels.
 *
 * Examples:
 *
 *    rgba(255,0,0,0.5)
 *    // => rgba(255,0,0,0.5)
 *
 *    rgba(255,0,0,1)
 *    // => #ff0000
 *
 *    rgba(#ffcc00, 50%)
 *    // rgba(255,204,0,0.5)
 *
 * @param {Unit|RGBA|HSLA} red
 * @param {Unit} green
 * @param {Unit} blue
 * @param {Unit} alpha
 * @return {RGBA}
 * @api public
 */

exports.rgba = function rgba(red, green, blue, alpha){
  switch (arguments.length) {
    case 1:
      utils.assertColor(red);
      var color = red.rgba;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , color.a);
    case 2:
      utils.assertColor(red);
      var color = red.rgba;
      utils.assertType(green, 'unit', 'alpha');
      if ('%' == green.type) green.val /= 100;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , green.val);
    default:
      utils.assertType(red, 'unit', 'red');
      utils.assertType(green, 'unit', 'green');
      utils.assertType(blue, 'unit', 'blue');
      utils.assertType(alpha, 'unit', 'alpha');
      var r = '%' == red.type ? Math.round(red.val * 2.55) : red.val;
      var g = '%' == green.type ? Math.round(green.val * 2.55) : green.val;
      var b = '%' == blue.type ? Math.round(blue.val * 2.55) : blue.val;
      if (alpha && '%' == alpha.type) alpha.val /= 100;
      return new nodes.RGBA(
          r
        , g
        , b
        , alpha.val);
  }
};

/**
 * Return a `RGBA` from the r,g,b channels.
 *
 * Examples:
 *
 *    rgb(255,204,0)
 *    // => #ffcc00
 *
 *    rgb(#fff)
 *    // => #fff
 *
 * @param {Unit|RGBA|HSLA} red
 * @param {Unit} green
 * @param {Unit} blue
 * @return {RGBA}
 * @api public
 */

exports.rgb = function rgb(red, green, blue){
  switch (arguments.length) {
    case 1:
      utils.assertColor(red);
      var color = red.rgba;
      return new nodes.RGBA(
          color.r
        , color.g
        , color.b
        , 1);
    default:
      return exports.rgba(
          red
        , green
        , blue
        , new nodes.Unit(1));
  }
};

/**
 * Convert a .json file into stylus variables
 * Nested variable object keys are joined with a dash (-)
 *
 * Given this sample media-queries.json file:
 * {
 *   "small": "screen and (max-width:400px)",
 *   "tablet": {
 *     "landscape": "screen and (min-width:600px) and (orientation:landscape)",
 *     "portrait": "screen and (min-width:600px) and (orientation:portrait)"
 *   }
 * }
 *
 * Examples:
 *
 *    json('media-queries.json')
 *    
 *    @media small
 *    // => @media screen and (max-width:400px)
 *
 *    @media tablet-landscape
 *    // => @media screen and (min-width:600px) and (orientation:landscape)
 *       
 * @param {String} path
 * @api public
*/

exports.json = function(path){
  utils.assertString(path, 'path');

  // lookup
  path = path.string;
  var found = utils.lookup(path, this.options.paths, this.options.filename);
  if (!found) throw new Error('failed to locate .json file ' + path);

  // read
  var str = fs.readFileSync(found, 'utf8');
  convert.call(this, JSON.parse(str));
  return;

  function convert(obj, prefix){
    prefix = prefix ? prefix + '-' : '';
    for (var key in obj){
      var val = obj[key];
      var name = prefix + key;
      if ('object' == typeof val) {
        convert.call(this, val, name);
      } else {
        val = utils.coerce(val);
        if ('string' == val.nodeName) val = parseUnit(val.string) || new nodes.Literal(val.string);
        this.global.scope.add({ name: name, val: val });
      }
    }
  }
};

/**
 * Unquote the given `str`.
 *
 * Examples:
 *
 *    unquote("sans-serif")
 *    // => sans-serif
 *
 *    unquote(sans-serif)
 *    // => sans-serif
 *
 * @param {String|Ident} string
 * @return {Literal}
 * @api public
 */

exports.unquote = function unquote(string){
  utils.assertString(string, 'string');
  return new nodes.Literal(string.string);
};

/**
 * Assign `type` to the given `unit` or return `unit`'s type.
 *
 * @param {Unit} unit
 * @param {String|Ident} type
 * @return {Unit}
 * @api public
 */

exports.unit = function unit(unit, type){
  utils.assertType(unit, 'unit', 'unit');

  // Assign
  if (type) {
    utils.assertString(type, 'type');
    return new nodes.Unit(unit.val, type.string);
  } else {
    return unit.type || '';
  }
};

/**
 * Lookup variable `name` or return Null.
 *
 * @param {String} name
 * @return {Mixed}
 * @api public
 */

exports.lookup = function lookup(name){
  utils.assertType(name, 'string', 'name');
  var node = this.lookup(name.val);
  if (!node) return nodes.null;
  return this.visit(node);
};

/**
 * Perform `op` on the `left` and `right` operands.
 *
 * @param {String} op
 * @param {Node} left
 * @param {Node} right
 * @return {Node}
 * @api public
 */

exports.operate = function operate(op, left, right){
  utils.assertType(op, 'string', 'op');
  utils.assertPresent(left, 'left');
  utils.assertPresent(right, 'right');
  return left.operate(op.val, right);
};

/**
 * Test if `val` matches the given `pattern`.
 *
 * Examples:
 *
 *     match('^foo(bar)?', foo)
 *     match('^foo(bar)?', foobar)
 *     match('^foo(bar)?', 'foo')
 *     match('^foo(bar)?', 'foobar')
 *     // => true
 *
 *     match('^foo(bar)?', 'bar')
 *     // => false
 *
 * @param {String} pattern
 * @param {String|Ident} val
 * @return {Boolean}
 * @api public
 */

exports.match = function match(pattern, val){
  utils.assertType(pattern, 'string', 'pattern');
  utils.assertString(val, 'val');
  var re = new RegExp(pattern.val);
  return nodes.Boolean(re.test(val.string));
};

/**
 * Return length of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Unit}
 * @api public
 */

(exports.length = function length(expr){
  if (expr) {
    return expr.nodes
      ? utils.unwrap(expr).nodes.length
      : 1;
  }
  return 0;
}).raw = true;

/**
 * Inspect the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

(exports.p = function p(){
  [].slice.call(arguments).forEach(function(expr){
    expr = utils.unwrap(expr);
    if (!expr.nodes.length) return;
    console.log('\033[90minspect:\033[0m %s', expr.toString().replace(/^\(|\)$/g, ''));
  })
  return nodes.null;
}).raw = true;

/**
 * Throw an error with the given `msg`.
 *
 * @param {String} msg
 * @api public
 */

exports.error = function error(msg){
  utils.assertType(msg, 'string', 'msg');
  throw new Error(msg.val);
};

/**
 * Warn with the given `msg` prefixed by "Warning: ".
 *
 * @param {String} msg
 * @api public
 */

exports.warn = function warn(msg){
  utils.assertType(msg, 'string', 'msg');
  console.warn('Warning: %s', msg.val);
  return nodes.null;
};

/**
 * Output stack trace.
 *
 * @api public
 */

exports.trace = function trace(){
  console.log(this.stack);
  return nodes.null;
};

/**
 * Push the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(exports.push = exports.append = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.push(utils.unwrap(arguments[i]));
  }
  return expr.nodes.length;
}).raw = true;

/**
 * Pop a value from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

(exports.pop = function pop(expr) {
  expr = utils.unwrap(expr);
  return expr.nodes.pop();
}).raw = true;

/**
 * Unshift the given args to `expr`.
 *
 * @param {Expression} expr
 * @param {Node} ...
 * @return {Unit}
 * @api public
 */

(exports.unshift = exports.prepend = function(expr){
  expr = utils.unwrap(expr);
  for (var i = 1, len = arguments.length; i < len; ++i) {
    expr.nodes.unshift(utils.unwrap(arguments[i]));
  }
  return expr.nodes.length;
}).raw = true;

/**
 * Shift an element from `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

 (exports.shift = function(expr){
   expr = utils.unwrap(expr);
   return expr.nodes.shift();
 }).raw = true;

/**
 * Return a `Literal` with the given `fmt`, and
 * variable number of arguments.
 *
 * @param {String} fmt
 * @param {Node} ...
 * @return {Literal}
 * @api public
 */

(exports.s = function s(fmt){
  fmt = utils.unwrap(fmt).nodes[0];
  utils.assertString(fmt);
  var self = this
    , str = fmt.string
    , args = arguments
    , i = 1;

  // format
  str = str.replace(/%(s|d)/g, function(_, specifier){
    var arg = args[i++] || nodes.null;
    switch (specifier) {
      case 's':
        return new Compiler(arg, self.options).compile();
      case 'd':
        arg = utils.unwrap(arg).first;
        if ('unit' != arg.nodeName) throw new Error('%d requires a unit');
        return arg.val;
    }
  });

  return new nodes.Literal(str);
}).raw = true;

/**
 * Return the opposites of the given `positions`.
 *
 * Examples:
 *
 *    opposite-position(top left)
 *    // => bottom right
 *
 * @param {Expression} positions
 * @return {Expression}
 * @api public
 */

(exports['opposite-position'] = function oppositePosition(positions){
  var expr = [];
  utils.unwrap(positions).nodes.forEach(function(pos, i){
    utils.assertString(pos, 'position ' + i);
    pos = (function(){ switch (pos.string) {
      case 'top': return 'bottom';
      case 'bottom': return 'top';
      case 'left': return 'right';
      case 'right': return 'left';
      case 'center': return 'center';
      default: throw new Error('invalid position ' + pos);
    }})();
    expr.push(new nodes.Literal(pos));
  });
  return expr;
}).raw = true;

/**
 * Return the width and height of the given `img` path.
 *
 * Examples:
 *
 *    image-size('foo.png')
 *    // => 200px 100px
 *
 *    image-size('foo.png')[0]
 *    // => 200px
 *
 *    image-size('foo.png')[1]
 *    // => 100px
 *
 * @param {String} img
 * @return {Expression}
 * @api public
 */

exports['image-size'] = function imageSize(img) {
  utils.assertType(img, 'string', 'img');
  var img = new Image(this, img.string);

  // Read size
  img.open();
  var size = img.size();
  img.close();

  // Return (w h)
  var expr = [];
  expr.push(new nodes.Unit(size[0], 'px'));
  expr.push(new nodes.Unit(size[1], 'px'));

  return expr;
};

/**
 * Apply Math `fn` to `n`.
 *
 * @param {Unit} n
 * @param {String} fn
 * @return {Unit}
 * @api private
 */

exports['-math'] = function math(n, fn){
  return new nodes.Unit(Math[fn.string](n.val), n.type);
};

/**
 * Get Math `prop`.
 *
 * @param {String} prop
 * @return {Unit}
 * @api private
 */

exports['-math-prop'] = function math(prop){
  return new nodes.Unit(Math[prop.string]);
};

/**
 * Buffer the given js `str`.
 *
 * @param {String} str
 * @return {JSLiteral}
 * @api private
 */

exports.js = function js(str){
  utils.assertString(str, 'str');
  return new nodes.JSLiteral(str.val);
};

/**
 * Adjust HSL `color` `prop` by `amount`.
 *
 * @param {RGBA|HSLA} color
 * @param {String} prop
 * @param {Unit} amount
 * @return {RGBA}
 * @api private
 */

exports['-adjust'] = function adjust(color, prop, amount){
  var hsl = color.hsla.clone();
  prop = { hue: 'h', saturation: 's', lightness: 'l' }[prop.string];
  if (!prop) throw new Error('invalid adjustment property');
  var val = amount.val;
  if ('%' == amount.type){
    val = 'l' == prop && val > 0
      ? (100 - hsl[prop]) * val / 100
      : hsl[prop] * (val / 100);
  }
  hsl[prop] += val;
  return hsl.rgba;
};

/**
 * Return a clone of the given `expr`.
 *
 * @param {Expression} expr
 * @return {Node}
 * @api public
 */

(exports.clone = function clone(expr){
  utils.assertPresent(expr, 'expr');
  return expr.clone();
}).raw = true;

/**
 * Add property `name` with the given `expr`
 * to the mixin-able block.
 *
 * @param {String|Ident|Literal} name
 * @param {Expression} expr
 * @return {Property}
 * @api public
 */

(exports['add-property'] = function addProperty(name, expr){
  utils.assertType(name, 'expression', 'name');
  name = utils.unwrap(name).first;
  utils.assertString(name, 'name');
  utils.assertType(expr, 'expression', 'expr');
  var prop = new nodes.Property([name], expr);
  var block = this.closestBlock;

  var len = block.nodes.length
    , head = block.nodes.slice(0, block.index)
    , tail = block.nodes.slice(block.index++, len);
  head.push(prop);
  block.nodes = head.concat(tail);
  
  return prop;
}).raw = true;

/**
 * Attempt to parse unit `str`.
 *
 * @param {String} str
 * @return {Unit}
 * @api public
 */

function parseUnit(str){
  var m = str.match(/^(\d+)(.*)/);
  if (!m) return;
  var n = parseInt(m[1], 10);
  var type = m[2];
  return new nodes.Unit(n, type);
}
});

require.define("/lib/visitor/compiler.js",function(require,module,exports,__dirname,__filename,process,global){/*!
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
 *   - `compress`  Compress the css output, defaults to false
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
  this.js = '';
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
  var node;

  if (block.hasProperties) {
    var arr = [this.compress ? '{' : ' {'];
    ++this.indents;
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = len - 1 == i;
      node = block.nodes[i];
      switch (node.nodeName) {
        case 'null':
        case 'expression':
        case 'function':
        case 'jsliteral':
        case 'group':
        case 'unit':
          continue;
        case 'media':
          // Prevent double-writing the @media declaration when
          // nested inside of a function/mixin
          if (node.block.parent.scope) {
            continue;
          }
        default:
          arr.push(this.visit(node));
      }
    }
    --this.indents;
    arr.push(this.indent + '}');
    this.buf += arr.join(this.compress ? '' : '\n');
    this.buf += '\n';
  }

  // Nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'group':
      case 'print':
      case 'page':
      case 'block':
      case 'keyframes':
        if (this.linenos || this.firebug) this.debugInfo(node);
        this.visit(node);
        break;
      case 'media':
      case 'mozdocument':
      case 'import':
      case 'fontface':
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
  var comma = this.compress ? ',' : ', ';

  var prefix = 'official' == node.prefix
    ? ''
    : '-' + node.prefix + '-';

  this.buf += '@' + prefix + 'keyframes '
    + this.visit(node.name)
    + (this.compress ? '{' : ' {');

  ++this.indents;
  node.frames.forEach(function(frame){
    if (!this.compress) this.buf += '\n  ';
    this.buf += this.visit(frame.pos.join(comma));
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
 * Visit MozDocument.
 */

Compiler.prototype.visitMozDocument = function(mozdocument){
  this.buf += '@-moz-document ' + mozdocument.val;
  this.buf += this.compress ? '{' : ' {\n';
  ++this.indents;
  this.visit(mozdocument.block);
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
 * Visit Import.
 */

Compiler.prototype.visitImport = function(imported){
  this.buf += '@import ' + this.visit(imported.path) + ';\n';
};

/**
 * Visit FontFace.
 */

Compiler.prototype.visitFontFace = function(face){
  this.buf += this.indent + '@font-face';
  this.visit(face.block);
};

/**
 * Visit JSLiteral.
 */

Compiler.prototype.visitJSLiteral = function(js){
  this.js += '\n' + js.val.replace(/@selector/g, '"' + this.selector + '"');
  return '';
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
    // Zero is always '0', unless when
    // a percentage, this is required by keyframes
    if ('%' != type && 0 == n) return '0';
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
  var stack = this.stack;

  stack.push(group.nodes);

  // selectors
  if (group.block.hasProperties) {
    var selectors = this.compileSelectors(stack);
    this.buf += (this.selector = selectors.join(this.compress ? ',' : ',\n'));
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
 * Compile selector strings in `arr` from the bottom-up
 * to produce the selector combinations. For example
 * the following Stylus:
 *
 *    ul
 *      li
 *      p
 *        a
 *          color: red
 *
 * Would return:
 *
 *      [ 'ul li a', 'ul p a' ]
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

Compiler.prototype.compileSelectors = function(arr){
  var stack = this.stack
    , self = this
    , selectors = []
    , buf = [];

  function interpolateParent(selector, buf) {
    var str = selector.val.trim();
    if (buf.length) {
      for (var i = 0, len = buf.length; i < len; ++i) {
        if (~buf[i].indexOf('&')) {
          str = buf[i].replace(/&/g, str).trim();
        } else {
          str += ' ' + buf[i].trim();
        }
      }
    }
    return str;
  }

  function compile(arr, i) {
    if (i) {
      arr[i].forEach(function(selector){
        if (selector.inherits) {
          buf.unshift(selector.val);
          compile(arr, i - 1);
          buf.shift();
        } else {
          selectors.push(interpolateParent(selector, buf));
        }
      });
    } else {
      arr[0].forEach(function(selector){
        var str = interpolateParent(selector, buf);
        selectors.push(self.indent + str.trimRight());
      });
    }
  }

  compile(arr, arr.length - 1);

  return selectors;
};

/**
 * Debug info.
 */

Compiler.prototype.debugInfo = function(node){

  var path = node.filename == 'stdin' ? 'stdin' : fs.realpathSync(node.filename)
    , line = node.nodes ? node.nodes[0].lineno : node.lineno;

  if (this.linenos){
    this.buf += '\n/* ' + 'line ' + line + ' : ' + path + ' */\n';
  }

  if (this.firebug){
    // debug info for firebug, the crazy formatting is needed
    path = 'file\\\:\\\/\\\/' + path.replace(/(\/|\.)/g, '\\$1');
    line = '\\00003' + line;
    this.buf += '\n@media -stylus-debug-info'
      + '{filename{font-family:' + path
      + '}line{font-family:' + line + '}}\n';
  }
}

});

require.define("/lib/functions/image.js",function(require,module,exports,__dirname,__filename,process,global){

/*!
 * Stylus - plugin - url
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('../utils')
  , nodes = require('../nodes')
  , fs = require('fs');

/**
 * Initialize a new `Image` with the given `ctx` and `path.
 *
 * @param {Evaluator} ctx
 * @param {String} path
 * @api private
 */

var Image = module.exports = function Image(ctx, path) {
  this.ctx = ctx;
  this.path = utils.lookup(path, ctx.paths);
  if (!this.path) throw new Error('failed to locate file ' + path);
};

/**
 * Open the image for reading.
 *
 * @api private
 */

Image.prototype.open = function(){
  this.fd = fs.openSync(this.path, 'r');
};

/**
 * Close the file.
 *
 * @api private
 */

Image.prototype.close = function(){
  if (this.fd) fs.closeSync(this.fd);
};

/**
 * Return the type of image, supports:
 *
 *  - gif
 *  - png
 *  - jpeg
 *
 * @return {String}
 * @api private
 */

Image.prototype.type = function(){
  var type
    , buf = new Buffer(4);
  
  fs.readSync(this.fd, buf, 0, 4, 0);

  // GIF
  if (0x47 == buf[0] && 0x49 == buf[1] && 0x46 == buf[2]) type = 'gif';

  // PNG
  else if (0x50 == buf[1] && 0x4E == buf[2] && 0x47 == buf[3]) type = 'png';

  // JPEG
  else if (0xff == buf[0] && 0xd8 == buf[1]) type = 'jpeg';

  return type;
};

/**
 * Return image dimensions `[width, height]`.
 *
 * @return {Array}
 * @api private
 */

Image.prototype.size = function(){
  var type = this.type()
    , width
    , height
    , buf;

  function uint16(b) { return b[1] << 8 | b[0]; }
  function uint32(b) { return b[0] << 24 | b[1] << 16 | b[2] << 8 | b[3]; } 

  // Determine dimensions
  switch (type) {
    case 'jpeg':
      throw new Error('image-size() jpeg support not yet implemented');
      break;
    case 'png':
      buf = new Buffer(8);
      // IHDR chunk width / height uint32_t big-endian
      fs.readSync(this.fd, buf, 0, 8, 16);
      width = uint32(buf);
      height = uint32(buf.slice(4, 8));
      break;
    case 'gif':
      buf = new Buffer(4);
      // width / height uint16_t little-endian
      fs.readSync(this.fd, buf, 0, 4, 6);
      width = uint16(buf);
      height = uint16(buf.slice(2, 4));
      break;
  }

  if ('number' != typeof width) throw new Error('failed to find width of "' + this.path + '"');
  if ('number' != typeof height) throw new Error('failed to find height of "' + this.path + '"');

  return [width, height];
};
});

require.define("/lib/colors.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - colors
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

module.exports = {
    aliceblue: [240, 248, 255]
  , antiquewhite: [250, 235, 215]
  , aqua: [0, 255, 255]
  , aquamarine: [127, 255, 212]
  , azure: [240, 255, 255]
  , beige: [245, 245, 220]
  , bisque: [255, 228, 196]
  , black: [0, 0, 0]
  , blanchedalmond: [255, 235, 205]
  , blue: [0, 0, 255]
  , blueviolet: [138, 43, 226]
  , brown: [165, 42, 42]
  , burlywood: [222, 184, 135]
  , cadetblue: [95, 158, 160]
  , chartreuse: [127, 255, 0]
  , chocolate: [210, 105, 30]
  , coral: [255, 127, 80]
  , cornflowerblue: [100, 149, 237]
  , cornsilk: [255, 248, 220]
  , crimson: [220, 20, 60]
  , cyan: [0, 255, 255]
  , darkblue: [0, 0, 139]
  , darkcyan: [0, 139, 139]
  , darkgoldenrod: [184, 132, 11]
  , darkgray: [169, 169, 169]
  , darkgreen: [0, 100, 0]
  , darkgrey: [169, 169, 169]
  , darkkhaki: [189, 183, 107]
  , darkmagenta: [139, 0, 139]
  , darkolivegreen: [85, 107, 47]
  , darkorange: [255, 140, 0]
  , darkorchid: [153, 50, 204]
  , darkred: [139, 0, 0]
  , darksalmon: [233, 150, 122]
  , darkseagreen: [143, 188, 143]
  , darkslateblue: [72, 61, 139]
  , darkslategray: [47, 79, 79]
  , darkslategrey: [47, 79, 79]
  , darkturquoise: [0, 206, 209]
  , darkviolet: [148, 0, 211]
  , deeppink: [255, 20, 147]
  , deepskyblue: [0, 191, 255]
  , dimgray: [105, 105, 105]
  , dimgrey: [105, 105, 105]
  , dodgerblue: [30, 144, 255]
  , firebrick: [178, 34, 34]
  , floralwhite: [255, 255, 240]
  , forestgreen: [34, 139, 34]
  , fuchsia: [255, 0, 255]
  , gainsboro: [220, 220, 220]
  , ghostwhite: [248, 248, 255]
  , gold: [255, 215, 0]
  , goldenrod: [218, 165, 32]
  , gray: [128, 128, 128]
  , green: [0, 128, 0]
  , greenyellow: [173, 255, 47]
  , grey: [128, 128, 128]
  , honeydew: [240, 255, 240]
  , hotpink: [255, 105, 180]
  , indianred: [205, 92, 92]
  , indigo: [75, 0, 130]
  , ivory: [255, 255, 240]
  , khaki: [240, 230, 140]
  , lavender: [230, 230, 250]
  , lavenderblush: [255, 240, 245]
  , lawngreen: [124, 252, 0]
  , lemonchiffon: [255, 250, 205]
  , lightblue: [173, 216, 230]
  , lightcoral: [240, 128, 128]
  , lightcyan: [224, 255, 255]
  , lightgoldenrodyellow: [250, 250, 210]
  , lightgray: [211, 211, 211]
  , lightgreen: [144, 238, 144]
  , lightgrey: [211, 211, 211]
  , lightpink: [255, 182, 193]
  , lightsalmon: [255, 160, 122]
  , lightseagreen: [32, 178, 170]
  , lightskyblue: [135, 206, 250]
  , lightslategray: [119, 136, 153]
  , lightslategrey: [119, 136, 153]
  , lightsteelblue: [176, 196, 222]
  , lightyellow: [255, 255, 224]
  , lime: [0, 255, 0]
  , limegreen: [50, 205, 50]
  , linen: [250, 240, 230]
  , magenta: [255, 0, 255]
  , maroon: [128, 0, 0]
  , mediumaquamarine: [102, 205, 170]
  , mediumblue: [0, 0, 205]
  , mediumorchid: [186, 85, 211]
  , mediumpurple: [147, 112, 219]
  , mediumseagreen: [60, 179, 113]
  , mediumslateblue: [123, 104, 238]
  , mediumspringgreen: [0, 250, 154]
  , mediumturquoise: [72, 209, 204]
  , mediumvioletred: [199, 21, 133]
  , midnightblue: [25, 25, 112]
  , mintcream: [245, 255, 250]
  , mistyrose: [255, 228, 225]
  , moccasin: [255, 228, 181]
  , navajowhite: [255, 222, 173]
  , navy: [0, 0, 128]
  , oldlace: [253, 245, 230]
  , olive: [128, 128, 0]
  , olivedrab: [107, 142, 35]
  , orange: [255, 165, 0]
  , orangered: [255, 69, 0]
  , orchid: [218, 112, 214]
  , palegoldenrod: [238, 232, 170]
  , palegreen: [152, 251, 152]
  , paleturquoise: [175, 238, 238]
  , palevioletred: [219, 112, 147]
  , papayawhip: [255, 239, 213]
  , peachpuff: [255, 218, 185]
  , peru: [205, 133, 63]
  , pink: [255, 192, 203]
  , plum: [221, 160, 203]
  , powderblue: [176, 224, 230]
  , purple: [128, 0, 128]
  , red: [255, 0, 0]
  , rosybrown: [188, 143, 143]
  , royalblue: [65, 105, 225]
  , saddlebrown: [139, 69, 19]
  , salmon: [250, 128, 114]
  , sandybrown: [244, 164, 96]
  , seagreen: [46, 139, 87]
  , seashell: [255, 245, 238]
  , sienna: [160, 82, 45]
  , silver: [192, 192, 192]
  , skyblue: [135, 206, 235]
  , slateblue: [106, 90, 205]
  , slategray: [119, 128, 144]
  , slategrey: [119, 128, 144]
  , snow: [255, 255, 250]
  , springgreen: [0, 255, 127]
  , steelblue: [70, 130, 180]
  , tan: [210, 180, 140]
  , teal: [0, 128, 128]
  , thistle: [216, 191, 216]
  , tomato: [255, 99, 71]
  , turquoise: [64, 224, 208]
  , violet: [238, 130, 238]
  , wheat: [245, 222, 179]
  , white: [255, 255, 255]
  , whitesmoke: [245, 245, 245]
  , yellow: [255, 255, 0]
  , yellowgreen: [154, 205, 5]
};
});

require.define("/node_modules/debug/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"index"}
});

require.define("/node_modules/debug/index.js",function(require,module,exports,__dirname,__filename,process,global){
module.exports = require('./lib/debug');
});

require.define("/node_modules/debug/lib/debug.js",function(require,module,exports,__dirname,__filename,process,global){
/**
 * Module dependencies.
 */

var tty = require('tty');

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Enabled debuggers.
 */

var names = []
  , skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name){
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

/**
 * Colors.
 */

var colors = [6, 2, 3, 4, 5, 1];

/**
 * Previous debug() call.
 */

var prev = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Is stdout a TTY? Colored output is disabled when `true`.
 */

var isatty = tty.isatty(2);

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function color() {
  return colors[prevColor++ % colors.length];
}

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

function humanize(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
}

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  function disabled(){}
  disabled.enabled = false;

  var match = skips.some(function(re){
    return re.test(name);
  });

  if (match) return disabled;

  match = names.some(function(re){
    return re.test(name);
  });

  if (!match) return disabled;
  var c = color();

  function colored(fmt) {
    var curr = new Date;
    var ms = curr - (prev[name] || curr);
    prev[name] = curr;

    fmt = '  \033[9' + c + 'm' + name + ' '
      + '\033[3' + c + 'm\033[90m'
      + fmt + '\033[3' + c + 'm'
      + ' +' + humanize(ms) + '\033[0m';

    console.error.apply(this, arguments);
  }

  function plain(fmt) {
    fmt = new Date().toUTCString()
      + ' ' + name + ' ' + fmt;
    console.error.apply(this, arguments);
  }

  colored.enabled = plain.enabled = true;

  return isatty
    ? colored
    : plain;
}

});

require.define("tty",function(require,module,exports,__dirname,__filename,process,global){exports.isatty = function () {};
exports.setRawMode = function () {};

});

require.define("/lib/nodes/root.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Root
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Root` node.
 *
 * @api public
 */

var Root = module.exports = function Root(){
  this.nodes = [];
};

/**
 * Inherit from `Node.prototype`.
 */

Root.prototype.__proto__ = Node.prototype;

/**
 * Push a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Root.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Unshift a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Root.prototype.unshift = function(node){
  this.nodes.unshift(node);
};

/**
 * Return "root".
 *
 * @return {String}
 * @api public
 */

Root.prototype.toString = function(){
  return '[Root]';
};

});

require.define("/lib/nodes/null.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Null
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Null` node.
 *
 * @api public
 */

var Null = module.exports = function Null(){};

/**
 * Inherit from `Node.prototype`.
 */

Null.prototype.__proto__ = Node.prototype;

/**
 * Return 'Null'.
 *
 * @return {String}
 * @api public
 */

Null.prototype.inspect = 
Null.prototype.toString = function(){
  return 'null';
};

/**
 * Return false.
 *
 * @return {Boolean}
 * @api public
 */

Null.prototype.toBoolean = function(){
  return nodes.false;
};

/**
 * Check if the node is a null node.
 *
 * @return {Boolean}
 * @api public
 */

Null.prototype.__defineGetter__('isNull', function(){
  return true;
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Null.prototype.__defineGetter__('hash', function(){
  return null;
});
});

require.define("/lib/nodes/each.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Each
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Each` node with the given `val` name,
 * `key` name, `expr`, and `block`.
 *
 * @param {String} val
 * @param {String} key
 * @param {Expression} expr
 * @param {Block} block
 * @api public
 */

var Each = module.exports = function Each(val, key, expr, block){
  Node.call(this);
  this.val = val;
  this.key = key;
  this.expr = expr;
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

Each.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Each.prototype.clone = function(){
  var clone = new Each(
      this.val
    , this.key
    , this.expr.clone()
    , this.block.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};
});

require.define("/lib/nodes/if.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - If
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `If` with the given `cond`.
 *
 * @param {Expression} cond
 * @param {Boolean|Block} negate, block
 * @api public
 */

var If = module.exports = function If(cond, negate){
  Node.call(this);
  this.cond = cond;
  this.elses = [];
  if (negate && negate.nodeName) {
    this.block = negate;
  } else {
    this.negate = negate;
  }
};

/**
 * Inherit from `Node.prototype`.
 */

If.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

If.prototype.clone = function(){
  var cond = this.cond.clone()
    , block = this.block.clone();
  var clone = new If(cond, block);
  clone.elses = this.elses.map(function(node){ return node.clone(); });
  clone.negate = this.negate;
  clone.postfix = this.postfix;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

});

require.define("/lib/nodes/call.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Call
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Call` with `name` and `args`.
 *
 * @param {String} name
 * @param {Expression} args
 * @api public
 */

var Call = module.exports = function Call(name, args){
  Node.call(this);
  this.name = name;
  this.args = args;
};

/**
 * Inherit from `Node.prototype`.
 */

Call.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Call.prototype.clone = function(){
  var clone = new Call(this.name, this.args.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return <name>().
 *
 * @return {String}
 * @api public
 */

Call.prototype.toString = function(){
  return this.name + '()';
};
});

require.define("/lib/nodes/page.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Page
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Page` with the given `selector` and `block`.
 *
 * @param {Selector} selector
 * @param {Block} block
 * @api public
 */

var Page = module.exports = function Page(selector, block){
  Node.call(this);
  this.selector = selector;
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

Page.prototype.__proto__ = Node.prototype;

/**
 * Return `@page name`.
 *
 * @return {String}
 * @api public
 */

Page.prototype.toString = function(){
  return '@page ' + this.selector;
};

});

require.define("/lib/nodes/fontface.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - FontFace
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `FontFace` with the given `block`.
 *
 * @param {Block} block
 * @api public
 */

var FontFace = module.exports = function FontFace(block){
  Node.call(this);
  this.block = block;
};

/**
 * Inherit from `Node.prototype`.
 */

FontFace.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

FontFace.prototype.clone = function(){
  var clone = new FontFace(this.block.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return `@oage name`.
 *
 * @return {String}
 * @api public
 */

FontFace.prototype.toString = function(){
  return '@font-face';
};

});

require.define("/lib/nodes/unaryop.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - UnaryOp
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `UnaryOp` with `op`, and `expr`.
 *
 * @param {String} op
 * @param {Node} expr
 * @api public
 */

var UnaryOp = module.exports = function UnaryOp(op, expr){
  Node.call(this);
  this.op = op;
  this.expr = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

UnaryOp.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

UnaryOp.prototype.clone = function(){
  var clone = new UnaryOp(this.op, this.expr.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};
});

require.define("/lib/nodes/binop.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - BinOp
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `BinOp` with `op`, `left` and `right`.
 *
 * @param {String} op
 * @param {Node} left
 * @param {Node} right
 * @api public
 */

var BinOp = module.exports = function BinOp(op, left, right){
  Node.call(this);
  this.op = op;
  this.left = left;
  this.right = right;
};

/**
 * Inherit from `Node.prototype`.
 */

BinOp.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

BinOp.prototype.clone = function(){
  var clone = new BinOp(
      this.op
    , this.left.clone()
    , this.right ?
      this.right.clone()
      : null);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  if (this.val) clone.val = this.val.clone();
  return clone;
};
});

require.define("/lib/nodes/ternary.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Ternary
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Ternary` with `cond`, `trueExpr` and `falseExpr`.
 *
 * @param {Expression} cond
 * @param {Expression} trueExpr
 * @param {Expression} falseExpr
 * @api public
 */

var Ternary = module.exports = function Ternary(cond, trueExpr, falseExpr){
  Node.call(this);
  this.cond = cond;
  this.trueExpr = trueExpr;
  this.falseExpr = falseExpr;
};

/**
 * Inherit from `Node.prototype`.
 */

Ternary.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Ternary.prototype.clone = function(){
  var clone = new Ternary(
      this.cond.clone()
    , this.trueExpr.clone()
    , this.falseExpr.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};
});

require.define("/lib/nodes/block.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Block
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Block` node with `parent` Block.
 *
 * @param {Block} parent
 * @api public
 */

var Block = module.exports = function Block(parent, node){
  Node.call(this);
  this.nodes = [];
  this.parent = parent;
  this.node = node;
  this.scope = true;
};

/**
 * Inherit from `Node.prototype`.
 */

Block.prototype.__proto__ = Node.prototype;

/**
 * Check if this block has properties..
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('hasProperties', function(){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    if ('property' == this.nodes[i].nodeName) {
      return true;
    }
  }
});

/**
 * Check if this block is empty.
 *
 * @return {Boolean}
 * @api public
 */

Block.prototype.__defineGetter__('isEmpty', function(){
  return !this.nodes.length;
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Block.prototype.clone = function(){
  var clone = new Block(this.parent, this.node);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.scope = this.scope;
  this.nodes.forEach(function(node){
    node = node.clone();
    switch (node.nodeName) {
      case 'each':
      case 'group':
        node.block.parent = clone;
        break;
      case 'ident':
        if ('function' == node.val.nodeName) {
          node.val.block.parent = clone;
        }
    }
    clone.push(node);
  });
  return clone;
};

/**
 * Push a `node` to this block.
 *
 * @param {Node} node
 * @api public
 */

Block.prototype.push = function(node){
  this.nodes.push(node);
};

});

require.define("/lib/nodes/unit.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Unit
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Unit` with the given `val` and unit `type`
 * such as "px", "pt", "in", etc.
 *
 * @param {String} val
 * @param {String} type
 * @api public
 */

var Unit = module.exports = function Unit(val, type){
  Node.call(this);
  this.val = val;
  this.type = type;
};

/**
 * Inherit from `Node.prototype`.
 */

Unit.prototype.__proto__ = Node.prototype;

/**
 * Return Boolean based on the unit value.
 *
 * @return {Boolean}
 * @api public
 */

Unit.prototype.toBoolean = function(){
  return nodes.Boolean(this.type
      ? true
      : this.val);
};

/**
 * Return unit string.
 *
 * @return {String}
 * @api public
 */

Unit.prototype.toString = function(){
  var n = this.val;
  if ('px' == this.type) n = n.toFixed(0);
  return n + (this.type || '');
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Unit.prototype.clone = function(){
  var clone = new Unit(this.val, this.type);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Unit.prototype.operate = function(op, right){
  var type = this.type || right.first.type;

  // swap color
  if ('rgba' == right.nodeName || 'hsla' == right.nodeName) {
    return right.operate(op, this);
  }

  // operate
  if (this.shouldCoerce(op)) {
    right = right.first;
    // percentages
    if (('-' == op || '+' == op) && '%' == right.type) {
      right = new Unit(this.val * (right.val / 100), '%');
    } else {
      right = this.coerce(right);
    }

    switch (op) {
      case '-':
        return new Unit(this.val - right.val, type);
      case '+':                               
        return new Unit(this.val + right.val, type);
      case '/':                               
        return new Unit(this.val / right.val, type);
      case '*':                               
        return new Unit(this.val * right.val, type);
      case '%':
        return new Unit(this.val % right.val, type);
      case '**':
        return new Unit(Math.pow(this.val, right.val), type);
      case '..':
      case '...':
        var start = this.val
          , end = right.val
          , expr = new nodes.Expression
          , inclusive = '..' == op;
        do {
          expr.push(new nodes.Unit(start));
        } while (inclusive ? ++start <= end : ++start < end);
        return expr;
    }
  }

  return Node.prototype.operate.call(this, op, right);
};

/**
 * Coerce `other` unit to the same type as `this` unit.
 *
 * Supports:
 *
 *    mm -> cm | in
 *    cm -> mm | in
 *    in -> mm | cm
 *    
 *    ms -> s
 *    s  -> ms
 *    
 *    Hz  -> kHz
 *    kHz -> Hz
 *
 * @param {Unit} other
 * @return {Unit}
 * @api public
 */

Unit.prototype.coerce = function(other){
  if ('unit' == other.nodeName) {
    var a = this
      , b = other;
    switch (a.type) {
      case 'mm':
        switch (b.type) {
          case 'cm':
            return new nodes.Unit(b.val * 2.54, 'mm');
          case 'in':
            return new nodes.Unit(b.val * 25.4, 'mm');
        }
      case 'cm':
        switch (b.type) {
          case 'mm':
            return new nodes.Unit(b.val / 10, 'cm');
          case 'in':
            return new nodes.Unit(b.val * 2.54, 'cm');
        }
      case 'in':
        switch (b.type) {
          case 'mm':
            return new nodes.Unit(b.val / 25.4, 'in');
          case 'cm':
            return new nodes.Unit(b.val / 2.54, 'in');
        }
      case 'ms':
        switch (b.type) {
          case 's':
            return new nodes.Unit(b.val * 1000, 'ms');
        }
      case 's':
        switch (b.type) {
          case 'ms':
            return new nodes.Unit(b.val / 1000, 's');
        }
      case 'Hz':
        switch (b.type) {
          case 'kHz':
            return new nodes.Unit(b.val * 1000, 'Hz');
        }
      case 'kHz':
        switch (b.type) {
          case 'Hz':
            return new nodes.Unit(b.val / 1000, 'kHz');
        }
      default:
        return new nodes.Unit(b.val, a.type);
    }
  } else if ('string' == other.nodeName) {
    var val = parseInt(other.val, 10);
    if (isNaN(val)) Node.prototype.coerce.call(this, other);
    return new nodes.Unit(val);
  } else {
    return Node.prototype.coerce.call(this, other);
  }
};

});

require.define("/lib/nodes/string.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - String
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , sprintf = require('../functions').s
  , utils = require('../utils')
  , nodes = require('./');

/**
 * Initialize a new `String` with the given `val`.
 *
 * @param {String} val
 * @param {String} quote
 * @api public
 */

var String = module.exports = function String(val, quote){
  Node.call(this);
  this.val = val;
  this.string = val;
  this.quote = quote || "'";
};

/**
 * Inherit from `Node.prototype`.
 */

String.prototype.__proto__ = Node.prototype;

/**
 * Return quoted string.
 *
 * @return {String}
 * @api public
 */

String.prototype.toString = function(){
  return this.quote + this.val + this.quote;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

String.prototype.clone = function(){
  var clone = new String(this.val, this.quote);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return Boolean based on the length of this string.
 *
 * @return {Boolean}
 * @api public
 */

String.prototype.toBoolean = function(){
  return nodes.Boolean(this.val.length);
};

/**
 * Coerce `other` to a string.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

String.prototype.coerce = function(other){
  switch (other.nodeName) {
    case 'string':
      return other;
    case 'expression':
      return new String(other.nodes.map(function(node){
        return this.coerce(node).val;
      }, this).join(' '));
    default:
      return new String(other.toString());
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

String.prototype.operate = function(op, right){
  switch (op) {
    case '%':
      var expr = new nodes.Expression;
      expr.push(this);

      // constructargs
      var args = 'expression' == right.nodeName
        ? utils.unwrap(right).nodes
        : [right];

      // apply
      return sprintf.apply(null, [expr].concat(args));
    case '+':
      return new String(this.val + this.coerce(right).val);
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

});

require.define("/lib/nodes/hsla.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - HSLA
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `HSLA` with the given h,s,l,a component values.
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} l
 * @param {Number} a
 * @api public
 */

var HSLA = exports = module.exports = function HSLA(h,s,l,a){
  Node.call(this);
  this.h = clampDegrees(h);
  this.s = clampPercentage(s);
  this.l = clampPercentage(l);
  this.a = clampAlpha(a);
  this.hsla = this;
};

/**
 * Inherit from `Node.prototype`.
 */

HSLA.prototype.__proto__ = Node.prototype;

/**
 * Return hsla(n,n,n,n).
 *
 * @return {String}
 * @api public
 */

HSLA.prototype.toString = function(){
  return 'hsla('
    + this.h + ','
    + this.s.toFixed(0) + ','
    + this.l.toFixed(0) + ','
    + this.a + ')';
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

HSLA.prototype.clone = function(){
  var clone = new HSLA(
      this.h
    , this.s
    , this.l
    , this.a);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return rgba `RGBA` representation.
 *
 * @return {RGBA}
 * @api public
 */

HSLA.prototype.__defineGetter__('rgba', function(){
  return nodes.RGBA.fromHSLA(this);
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

HSLA.prototype.__defineGetter__('hash', function(){
  return this.rgba.toString();
});

/**
 * Add h,s,l to the current component values.
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} l
 * @return {HSLA} new node
 * @api public
 */

HSLA.prototype.add = function(h,s,l){
  return new HSLA(
      this.h + h
    , this.s + s
    , this.l + l
    , this.a);
};

/**
 * Subtract h,s,l from the current component values.
 *
 * @param {Number} h
 * @param {Number} s
 * @param {Number} l
 * @return {HSLA} new node
 * @api public
 */

HSLA.prototype.sub = function(h,s,l){
  return this.add(-h, -s, -l);
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

HSLA.prototype.operate = function(op, right){
  switch (op) {
    case '==':
    case '!=':
    case '<=':
    case '>=':
    case '<':
    case '>':
    case 'is a':
    case '||':
    case '&&':
      return this.rgba.operate(op, right);
    default:
      return this.rgba.operate(op, right).hsla;
  }
};

/**
 * Return `HSLA` representation of the given `color`.
 *
 * @param {RGBA} color
 * @return {HSLA}
 * @api public
 */

exports.fromRGBA = function(rgba){
  var r = rgba.r / 255
    , g = rgba.g / 255
    , b = rgba.b / 255
    , a = rgba.a;

  var min = Math.min(r,g,b)
    , max = Math.max(r,g,b)
    , l = (max + min) / 2
    , d = max - min
    , h, s;

  switch (max) {
    case min: h = 0; break;
    case r: h = 60 * (g-b) / d; break;
    case g: h = 60 * (b-r) / d + 120; break;
    case b: h = 60 * (r-g) / d + 240; break;
  }

  if (max == min) {
    s = 0;
  } else if (l < .5) {
    s = d / (2 * l);
  } else {
    s = d / (2 - 2 * l);
  }

  h %= 360;
  s *= 100;
  l *= 100;

  return new HSLA(h,s,l,a);
};

/**
 * Adjust lightness by `percent`.
 *
 * @param {Number} percent
 * @return {HSLA} for chaining
 * @api public
 */

HSLA.prototype.adjustLightness = function(percent){
  this.l = clampPercentage(this.l + this.l * (percent / 100));
  return this;
};

/**
 * Adjust hue by `deg`.
 *
 * @param {Number} deg
 * @return {HSLA} for chaining
 * @api public
 */

HSLA.prototype.adjustHue = function(deg){
  this.h = clampDegrees(this.h + deg);
  return this;
};

/**
 * Clamp degree `n` >= 0 and <= 360.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampDegrees(n) {
  n = n % 360;
  return n >= 0 ? n : 360 + n;
}

/**
 * Clamp percentage `n` >= 0 and <= 100.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampPercentage(n) {
  return Math.max(0, Math.min(n, 100));
}

/**
 * Clamp alpha `n` >= 0 and <= 1.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampAlpha(n) {
  return Math.max(0, Math.min(n, 1));
}

});

require.define("/lib/nodes/rgba.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - RGBA
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , HSLA = require('./hsla')
  , functions = require('../functions')
  , adjust = functions['-adjust']
  , nodes = require('./');

/**
 * Initialize a new `RGBA` with the given r,g,b,a component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @api public
 */

var RGBA = exports = module.exports = function RGBA(r,g,b,a){
  Node.call(this);
  this.r = clamp(r);
  this.g = clamp(g);
  this.b = clamp(b);
  this.a = clampAlpha(a);
  this.rgba = this;
};

/**
 * Inherit from `Node.prototype`.
 */

RGBA.prototype.__proto__ = Node.prototype;

/**
 * Return an `RGBA` without clamping values.
 * 
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @return {RGBA}
 * @api public
 */

RGBA.withoutClamping = function(r,g,b,a){
  var rgba = new RGBA(0,0,0,0);
  rgba.r = r;
  rgba.g = g;
  rgba.b = b;
  rgba.a = a;
  return rgba;
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

RGBA.prototype.clone = function(){
  var clone = new RGBA(
      this.r
    , this.g
    , this.b
    , this.a);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return true.
 *
 * @return {Boolean}
 * @api public
 */

RGBA.prototype.toBoolean = function(){
  return nodes.true;
};

/**
 * Return `HSLA` representation.
 *
 * @return {HSLA}
 * @api public
 */

RGBA.prototype.__defineGetter__('hsla', function(){
  return HSLA.fromRGBA(this);
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

RGBA.prototype.__defineGetter__('hash', function(){
  return this.toString();
});

/**
 * Add r,g,b,a to the current component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.add = function(r,g,b,a){
  return new RGBA(
      this.r + r
    , this.g + g
    , this.b + b
    , this.a + a);
};

/**
 * Subtract r,g,b,a from the current component values.
 *
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.sub = function(r,g,b,a){
  return new RGBA(
      this.r - r
    , this.g - g
    , this.b - b
    , a == 1 ? this.a : this.a - a);
};

/**
 * Multiply rgb components by `n`.
 *
 * @param {String} n
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.multiply = function(n){
  return new RGBA(
      this.r * n
    , this.g * n
    , this.b * n
    , this.a); 
};

/**
 * Divide rgb components by `n`.
 *
 * @param {String} n
 * @return {RGBA} new node
 * @api public
 */

RGBA.prototype.divide = function(n){
  return new RGBA(
      this.r / n
    , this.g / n
    , this.b / n
    , this.a); 
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

RGBA.prototype.operate = function(op, right){
  right = right.first;

  switch (op) {
    case 'is a':
      if ('string' == right.nodeName && 'color' == right.string) {
        return nodes.true;
      }
      break;
    case '+':
      switch (right.nodeName) {
        case 'unit':
          var n = right.val;
          switch (right.type) {
            case '%': return adjust(this, new nodes.String('lightness'), right);
            case 'deg': return this.hsla.adjustHue(n).rgba;
            default: return this.add(n,n,n,0);
          }
        case 'rgba':
          return this.add(right.r, right.g, right.b, right.a);
        case 'hsla':
          return this.hsla.add(right.h, right.s, right.l);
      }
      break;
    case '-':
      switch (right.nodeName) {
        case 'unit':
          var n = right.val;
          switch (right.type) {
            case '%': return adjust(this, new nodes.String('lightness'), new nodes.Unit(-n, '%'));
            case 'deg': return this.hsla.adjustHue(-n).rgba;
            default: return this.sub(n,n,n,0);
          }
        case 'rgba':
          return this.sub(right.r, right.g, right.b, right.a);
        case 'hsla':
          return this.hsla.sub(right.h, right.s, right.l);
      }
      break;
    case '*':
      switch (right.nodeName) {
        case 'unit':
          return this.multiply(right.val);
      }
      break;
    case '/':
      switch (right.nodeName) {
        case 'unit':
          return this.divide(right.val);
      }
      break;
  }
  return Node.prototype.operate.call(this, op, right);
};

/**
 * Return #nnnnnn, #nnn, or rgba(n,n,n,n) string representation of the color.
 *
 * @return {String}
 * @api public
 */

RGBA.prototype.toString = function(){
  function pad(n) {
    return n < 16
      ? '0' + n.toString(16)
      : n.toString(16);
  }

  if (1 == this.a) {
    var r = pad(this.r)
      , g = pad(this.g)
      , b = pad(this.b);

    // Compress
    if (r[0] == r[1] && g[0] == g[1] && b[0] == b[1]) {
      return '#' + r[0] + g[0] + b[0];
    } else {
      return '#' + r + g + b;
    }
  } else {
    return 'rgba('
      + this.r + ','
      + this.g + ','
      + this.b + ','
      + (+this.a.toFixed(3)) + ')';
  }
};

/**
 * Return a `RGBA` from the given `hsla`.
 *
 * @param {HSLA} hsla
 * @return {RGBA}
 * @api public
 */

exports.fromHSLA = function(hsla){
  var h = hsla.h / 360
    , s = hsla.s / 100
    , l = hsla.l / 100
    , a = hsla.a;

  var m2 = l <= .5 ? l * (s + 1) : l + s - l * s
    , m1 = l * 2 - m2;

  var r = hue(h + 1/3) * 0xff
    , g = hue(h) * 0xff
    , b = hue(h - 1/3) * 0xff;

  function hue(h) {
    if (h < 0) ++h;
    if (h > 1) --h;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
    return m1;
  }
  
  return new RGBA(r,g,b,a);
};

/**
 * Clamp `n` >= 0 and <= 255.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clamp(n) {
  return Math.max(0, Math.min(n.toFixed(0), 255));
}

/**
 * Clamp alpha `n` >= 0 and <= 1.
 *
 * @param {Number} n
 * @return {Number}
 * @api private
 */

function clampAlpha(n) {
  return Math.max(0, Math.min(n, 1));
}

});

require.define("/lib/nodes/ident.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Ident
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Ident` by `name` with the given `val` node.
 *
 * @param {String} name
 * @param {Node} val
 * @api public
 */

var Ident = module.exports = function Ident(name, val){
  Node.call(this);
  this.name = name;
  this.string = name;
  this.val = val || nodes.null;
};

/**
 * Check if the variable has a value.
 *
 * @return {Boolean}
 * @api public
 */

Ident.prototype.__defineGetter__('isEmpty', function(){
  return undefined == this.val;
});

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Ident.prototype.__defineGetter__('hash', function(){
  return this.name;
});

/**
 * Inherit from `Node.prototype`.
 */

Ident.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Ident.prototype.clone = function(){
  var clone = new Ident(this.name, this.val.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.property = this.property;
  return clone;
};

/**
 * Return <name>.
 *
 * @return {String}
 * @api public
 */

Ident.prototype.toString = function(){
  return this.name;
};

/**
 * Coerce `other` to an ident.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

Ident.prototype.coerce = function(other){
  switch (other.nodeName) {
    case 'ident':
    case 'string':
    case 'literal':
      return new Ident(other.string);
    default:
      return Node.prototype.coerce.call(this, other);
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Ident.prototype.operate = function(op, right){
  var val = right.first;
  switch (op) {
    case '-':
      if ('unit' == val.nodeName) {
        var expr = new nodes.Expression;
        val.val = -val.val;
        expr.push(this);
        expr.push(val);
        return expr;
      }
    case '+':
      return new nodes.Ident(this.string + this.coerce(val).string);
  }
  return Node.prototype.operate.call(this, op, right);
};

});

require.define("/lib/nodes/group.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Group
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Group`.
 *
 * @api public
 */

var Group = module.exports = function Group(){
  Node.call(this);
  this.nodes = [];
  this.extends = [];
};

/**
 * Inherit from `Node.prototype`.
 */

Group.prototype.__proto__ = Node.prototype;

/**
 * Push the given `selector` node.
 *
 * @param {Selector} selector
 * @api public
 */

Group.prototype.push = function(selector){
  this.nodes.push(selector);
};

/**
 * Return this set's `Block`.
 */

Group.prototype.__defineGetter__('block', function(){
  return this.nodes[0].block;
});

/**
 * Assign `block` to each selector in this set.
 *
 * @param {Block} block
 * @api public
 */

Group.prototype.__defineSetter__('block', function(block){
  for (var i = 0, len = this.nodes.length; i < len; ++i) {
    this.nodes[i].block = block;
  }
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Group.prototype.clone = function(){
  var clone = new Group;
  clone.lineno = this.lineno;
  this.nodes.forEach(function(node){
    clone.push(node.clone());
  });
  clone.filename = this.filename;
  clone.block = this.block.clone();
  return clone;
};

});

require.define("/lib/nodes/literal.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Literal
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Literal` with the given `str`.
 *
 * @param {String} str
 * @api public
 */

var Literal = module.exports = function Literal(str){
  Node.call(this);
  this.val = str;
  this.string = str;
};

/**
 * Inherit from `Node.prototype`.
 */

Literal.prototype.__proto__ = Node.prototype;

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Literal.prototype.__defineGetter__('hash', function(){
  return this.val;
});

/**
 * Return literal value.
 *
 * @return {String}
 * @api public
 */

Literal.prototype.toString = function(){
  return this.val;
};

/**
 * Coerce `other` to a literal.
 *
 * @param {Node} other
 * @return {String}
 * @api public
 */

Literal.prototype.coerce = function(other){
  switch (other.nodeName) {
    case 'ident':
    case 'string':
    case 'literal':
      return new Literal(other.string);
    default:
      return Node.prototype.coerce.call(this, other);
  }
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Literal.prototype.operate = function(op, right){
  var val = right.first;
  switch (op) {
    case '+':
      return new nodes.Literal(this.string + this.coerce(val).string);
    default:
      return Node.prototype.operate.call(this, op, right);
  }
};

});

require.define("/lib/nodes/jsliteral.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - JSLiteral
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `JSLiteral` with the given `str`.
 *
 * @param {String} str
 * @api public
 */

var JSLiteral = module.exports = function JSLiteral(str){
  Node.call(this);
  this.val = str;
  this.string = str;
};

/**
 * Inherit from `Node.prototype`.
 */

JSLiteral.prototype.__proto__ = Node.prototype;

});

require.define("/lib/nodes/boolean.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Boolean
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Boolean` node with the given `val`.
 *
 * @param {Boolean} val
 * @api public
 */

var Boolean = module.exports = function Boolean(val){
  Node.call(this);
  if (this.nodeName) {
    this.val = !!val;
  } else {
    return new Boolean(val);
  }
};

/**
 * Inherit from `Node.prototype`.
 */

Boolean.prototype.__proto__ = Node.prototype;

/**
 * Return `this` node.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.toBoolean = function(){
  return this;
};

/**
 * Return `true` if this node represents `true`.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.__defineGetter__('isTrue', function(){
  return this.val;
});

/**
 * Return `true` if this node represents `false`.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.__defineGetter__('isFalse', function(){
  return ! this.val;
});

/**
 * Negate the value.
 *
 * @return {Boolean}
 * @api public
 */

Boolean.prototype.negate = function(){
  return new Boolean(!this.val);
};

/**
 * Return 'Boolean'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.inspect = function(){
  return '[Boolean ' + this.val + ']';
};

/**
 * Return 'true' or 'false'.
 *
 * @return {String}
 * @api public
 */

Boolean.prototype.toString = function(){
  return this.val
    ? 'true'
    : 'false';
};
});

require.define("/lib/nodes/return.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Return
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Return` node with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Return = module.exports = function Return(expr){
  this.expr = expr || nodes.null;
};

/**
 * Inherit from `Node.prototype`.
 */

Return.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Return.prototype.clone = function(){
  var clone = new Return(this.expr.clone());
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};
});

require.define("/lib/nodes/media.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Media
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Media` with the given `val`
 *
 * @param {String} val
 * @api public
 */

var Media = module.exports = function Media(val){
  Node.call(this);
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Media.prototype.__proto__ = Node.prototype;

/**
 * Clone this node.
 *
 * @return {Media}
 * @api public
 */

Media.prototype.clone = function(){
  var clone = new Media(this.val);
  clone.block = this.block.clone();
  return clone;
};

/**
 * Return @media "val".
 *
 * @return {String}
 * @api public
 */

Media.prototype.toString = function(){
  return '@media ' + this.val;
};

});

require.define("/lib/nodes/params.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Params
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Params` with `name`, `params`, and `body`.
 *
 * @param {String} name
 * @param {Params} params
 * @param {Expression} body
 * @api public
 */

var Params = module.exports = function Params(){
  Node.call(this);
  this.nodes = [];
};

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

Params.prototype.__defineGetter__('length', function(){
  return this.nodes.length;
});

/**
 * Inherit from `Node.prototype`.
 */

Params.prototype.__proto__ = Node.prototype;

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

Params.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Params.prototype.clone = function(){
  var clone = new Params;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  this.nodes.forEach(function(node){
    clone.push(node.clone());
  });
  return clone;
};


});

require.define("/lib/nodes/comment.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Comment
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Comment` with the given `str`.
 *
 * @param {String} str
 * @param {Boolean} suppress
 * @api public
 */

var Comment = module.exports = function Comment(str, suppress){
  Node.call(this);
  this.str = str;
  this.suppress = suppress;
};

/**
 * Inherit from `Node.prototype`.
 */

Comment.prototype.__proto__ = Node.prototype;

});

require.define("/lib/nodes/keyframes.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Keyframes
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Keyframes` with the given `name`,
 * and optional vendor `prefix`.
 *
 * @param {String} name
 * @param {String} prefix
 * @api public
 */

var Keyframes = module.exports = function Keyframes(name, prefix){
  Node.call(this);
  this.name = name;
  this.frames = [];
  this.prefix = prefix || 'official';
};

/**
 * Inherit from `Node.prototype`.
 */

Keyframes.prototype.__proto__ = Node.prototype;

/**
 * Push the given `block` at `pos`.
 *
 * @param {Array} pos
 * @param {Block} block
 * @api public
 */

Keyframes.prototype.push = function(pos, block){
  this.frames.push({
      pos: pos
    , block: block
  });
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Keyframes.prototype.clone = function(){
  var clone = new Keyframes(this.name);
  clone.lineno = this.lineno;
  clone.prefix = this.prefix;
  clone.frames = this.frames.map(function(node){
    node.block = node.block.clone();
    return node;
  });
  return clone;
};

/**
 * Return `@keyframes name`.
 *
 * @return {String}
 * @api public
 */

Keyframes.prototype.toString = function(){
  return '@keyframes ' + this.name;
};

});

require.define("/lib/nodes/charset.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Charset
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('./');

/**
 * Initialize a new `Charset` with the given `val`
 *
 * @param {String} val
 * @api public
 */

var Charset = module.exports = function Charset(val){
  Node.call(this);
  this.val = val;
};

/**
 * Inherit from `Node.prototype`.
 */

Charset.prototype.__proto__ = Node.prototype;

/**
 * Return @charset "val".
 *
 * @return {String}
 * @api public
 */

Charset.prototype.toString = function(){
  return '@charset ' + this.val;
};

});

require.define("/lib/nodes/import.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Import
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Import` with the given `expr`.
 *
 * @param {Expression} expr
 * @api public
 */

var Import = module.exports = function Import(expr){
  Node.call(this);
  this.path = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

Import.prototype.__proto__ = Node.prototype;

});

require.define("/lib/nodes/extend.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Extend
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Extend` with the given `selector`.
 *
 * @param {Selector} selector
 * @api public
 */

var Extend = module.exports = function Extend(selector){
  Node.call(this);
  this.selector = selector;
};

/**
 * Inherit from `Node.prototype`.
 */

Extend.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Extend.prototype.clone = function(){
  return new Extend(this.selector);
};

/**
 * Return `@extend selector`.
 *
 * @return {String}
 * @api public
 */

Extend.prototype.toString = function(){
  return '@extend ' + this.selector;
};

});

require.define("/lib/nodes/function.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Function
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Function` with `name`, `params`, and `body`.
 *
 * @param {String} name
 * @param {Params|Function} params
 * @param {Block} body
 * @api public
 */

var Function = module.exports = function Function(name, params, body){
  Node.call(this);
  this.name = name;
  this.params = params;
  this.block = body;
  if ('function' == typeof params) this.fn = params;
};

/**
 * Check function arity.
 *
 * @return {Boolean}
 * @api public
 */

Function.prototype.__defineGetter__('arity', function(){
  return this.params.length;
});

/**
 * Inherit from `Node.prototype`.
 */

Function.prototype.__proto__ = Node.prototype;

/**
 * Return hash.
 *
 * @return {String}
 * @api public
 */

Function.prototype.__defineGetter__('hash', function(){
  return 'function ' + this.name;
});

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Function.prototype.clone = function(){
  if (this.fn) {
    var clone = new Function(
        this.name
      , this.fn);
  } else {
    var clone = new Function(
        this.name
      , this.params.clone()
      , this.block.clone());
  }
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

/**
 * Return <name>(param1, param2, ...).
 *
 * @return {String}
 * @api public
 */

Function.prototype.toString = function(){
  if (this.fn) {
    return this.name
      + '('
      + this.fn.toString()
        .match(/^function *\((.*?)\)/)
        .slice(1)
        .join(', ')
      + ')';
  } else {
    return this.name
      + '('
      + this.params.nodes.join(', ')
      + ')';
  }
};

});

require.define("/lib/nodes/property.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Property
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node');

/**
 * Initialize a new `Property` with the given `segs` and optional `expr`.
 *
 * @param {Array} segs
 * @param {Expression} expr
 * @api public
 */

var Property = module.exports = function Property(segs, expr){
  Node.call(this);
  this.segments = segs;
  this.expr = expr;
};

/**
 * Inherit from `Node.prototype`.
 */

Property.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Property.prototype.clone = function(){
  var clone = new Property(this.segments);
  clone.name = this.name;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.segments = this.segments.map(function(node){ return node.clone(); });
  if (this.expr) clone.expr = this.expr.clone();
  return clone;
};

/**
 * Return string representation of this node.
 *
 * @return {String}
 * @api public
 */

Property.prototype.toString = function(){
  return 'property(' + this.segments.join('') + ', ' + this.expr + ')';
};

/**
 * Operate on the property expression.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Property.prototype.operate = function(op, right, val){
  return this.expr.operate(op, right, val);
};

});

require.define("/lib/nodes/selector.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Selector
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Block = require('./block')
  , Node = require('./node');

/**
 * Initialize a new `Selector` with the given `segs`.
 *
 * @param {Array} segs
 * @api public
 */

var Selector = module.exports = function Selector(segs){
  Node.call(this);
  this.inherits = true;
  this.segments = segs;
};

/**
 * Inherit from `Node.prototype`.
 */

Selector.prototype.__proto__ = Node.prototype;

/**
 * Return the selector string.
 *
 * @return {String}
 * @api public
 */

Selector.prototype.toString = function(){
  return this.segments.join('');
};

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Selector.prototype.clone = function(){
  var clone = new Selector;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  clone.segments = this.segments.map(function(node){ return node.clone(); });
  return clone;
};

});

require.define("/lib/nodes/expression.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Expression
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('../nodes')
  , utils = require('../utils');

/**
 * Initialize a new `Expression`.
 *
 * @param {Boolean} isList
 * @api public
 */

var Expression = module.exports = function Expression(isList){
  Node.call(this);
  this.nodes = [];
  this.isList = isList;
};

/**
 * Check if the variable has a value.
 *
 * @return {Boolean}
 * @api public
 */

Expression.prototype.__defineGetter__('isEmpty', function(){
  return !this.nodes.length;
});

/**
 * Return the first node in this expression.
 *
 * @return {Node}
 * @api public
 */

Expression.prototype.__defineGetter__('first', function(){
  return this.nodes[0]
    ? this.nodes[0].first
    : nodes.null;
});

/**
 * Hash all the nodes in order.
 *
 * @return {String}
 * @api public
 */

Expression.prototype.__defineGetter__('hash', function(){
  return this.nodes.map(function(node){
    return node.hash;
  }).join('::');
});

/**
 * Inherit from `Node.prototype`.
 */

Expression.prototype.__proto__ = Node.prototype;

/**
 * Return a clone of this node.
 * 
 * @return {Node}
 * @api public
 */

Expression.prototype.clone = function(){
  var clone = new this.constructor(this.isList);
  clone.preserve = this.preserve;
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  for (var i = 0; i < this.nodes.length; ++i) {
    clone.push(this.nodes[i].clone());
  }
  return clone;
};

/**
 * Push the given `node`.
 *
 * @param {Node} node
 * @api public
 */

Expression.prototype.push = function(node){
  this.nodes.push(node);
};

/**
 * Operate on `right` with the given `op`.
 *
 * @param {String} op
 * @param {Node} right
 * @return {Node}
 * @api public
 */

Expression.prototype.operate = function(op, right, val){
  switch (op) {
    case '[]=':
      var self = this
        , range = utils.unwrap(right).nodes
        , val = utils.unwrap(val)
        , len;
      range.forEach(function(unit){
        len = self.nodes.length;
        if ('unit' == unit.nodeName) {
          var i = unit.val;
          while (i-- > len) self.nodes[i] = nodes.null;
          self.nodes[unit.val] = val;
        }
      });
      return val;
    case '[]':
      var expr = new nodes.Expression
        , vals = utils.unwrap(this).nodes
        , range = utils.unwrap(right).nodes;
      range.forEach(function(unit){
        if ('unit' == unit.nodeName) {
          var node = vals[unit.val];
          if (node) expr.push(node);
        }
      });
      return expr.isEmpty
        ? nodes.null
        : utils.unwrap(expr);
    case '||':
      return this.toBoolean().isTrue
        ? this
        : right;
    case 'in':
      return Node.prototype.operate.call(this, op, right);
    case '!=':
      return this.operate('==', right, val).negate();
    case '==':
      var len = this.nodes.length
        , right = right.toExpression()
        , a
        , b;
      if (len != right.nodes.length) return nodes.false;
      for (var i = 0; i < len; ++i) {
        a = this.nodes[i];
        b = right.nodes[i];
        if (a.operate(op, b).isTrue) continue;
        return nodes.false;
      }
      return nodes.true;
      break;
    default:
      return this.first.operate(op, right, val);
  }
};

/**
 * Expressions with length > 1 are truthy,
 * otherwise the first value's toBoolean()
 * method is invoked.
 *
 * @return {Boolean}
 * @api public
 */

Expression.prototype.toBoolean = function(){
  if (this.nodes.length > 1) return nodes.true;
  return this.first.toBoolean();
};

/**
 * Return "<a> <b> <c>" or "<a>, <b>, <c>" if
 * the expression represents a list.
 *
 * @return {String}
 * @api public
 */

Expression.prototype.toString = function(){
  return '(' + this.nodes.map(function(node){
    return node.toString();
  }).join(this.isList ? ', ' : ' ') + ')';
};


});

require.define("/lib/nodes/arguments.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Arguments
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Node = require('./node')
  , nodes = require('../nodes')
  , utils = require('../utils');

/**
 * Initialize a new `Arguments`.
 *
 * @api public
 */

var Arguments = module.exports = function Arguments(){
  nodes.Expression.call(this);
  this.map = {};
};

/**
 * Inherit from `nodes.Expression.prototype`.
 */

Arguments.prototype.__proto__ = nodes.Expression.prototype;

/**
 * Initialize an `Arguments` object with the nodes
 * from the given `expr`.
 *
 * @param {Expression} expr
 * @return {Arguments}
 * @api public
 */

Arguments.fromExpression = function(expr){
  var args = new Arguments
    , len = expr.nodes.length;
  args.lineno = expr.lineno;
  args.isList = expr.isList;
  for (var i = 0; i < len; ++i) {
    args.push(expr.nodes[i]);
  }
  return args;
};

/**
 * Return a clone of this node.
 *
 * @return {Node}
 * @api public
 */

Arguments.prototype.clone = function(){
  var clone = nodes.Expression.prototype.clone.call(this);
  clone.map = this.map;
  return clone;
};


});

require.define("/lib/nodes/mozdocument.js",function(require,module,exports,__dirname,__filename,process,global){var Node = require('./node')
  , nodes = require('./');

var MozDocument = module.exports = function MozDocument(val){
  Node.call(this);
  this.val = val;
};

MozDocument.prototype.__proto__ = Node.prototype;

MozDocument.prototype.clone = function(){
  var clone = new MozDocument(this.val);
  clone.block = this.block.clone();
  return clone;
};

MozDocument.prototype.toString = function(){
  return '@-moz-document ' + this.val;
}

});

require.define("/lib/errors.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - errors
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Expose constructors.
 */

exports.ParseError = ParseError;
exports.SyntaxError = SyntaxError;

/**
 * Inherit from `Error.prototype`.
 */

SyntaxError.prototype.__proto__ = Error.prototype;

/**
 * Initialize a new `ParseError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function ParseError(msg) {
  this.name = 'ParseError';
  this.message = msg;
  Error.captureStackTrace(this, ParseError);
}

/**
 * Inherit from `Error.prototype`.
 */

ParseError.prototype.__proto__ = Error.prototype;

/**
 * Initialize a new `SyntaxError` with the given `msg`.
 *
 * @param {String} msg
 * @api private
 */

function SyntaxError(msg) {
  this.name = 'SyntaxError';
  this.message = msg;
  Error.captureStackTrace(this, ParseError);
}

/**
 * Inherit from `Error.prototype`.
 */

SyntaxError.prototype.__proto__ = Error.prototype;


});

require.define("/lib/visitor/normalizer.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - Normalizer
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
 * Initialize a new `Normalizer` with the given `root` Node.
 *
 * This visitor implements the first stage of the duel-stage
 * compiler, tasked with stripping the "garbage" from
 * the evaluated nodes, ditching null rules, resolving
 * ruleset selectors etc. This step performs the logic
 * necessary to facilitate the "@extend" functionality,
 * as these must be resolved _before_ buffering output.
 *
 * @param {Node} root
 * @api public
 */

var Normalizer = module.exports = function Normalizer(root, options) {
  options = options || {};
  Visitor.call(this, root);
  this.stack = [];
  this.extends = {};
  this.map = {};
};

/**
 * Inherit from `Visitor.prototype`.
 */

Normalizer.prototype.__proto__ = Visitor.prototype;

/**
 * Normalize the node tree.
 *
 * @return {Node}
 * @api private
 */

Normalizer.prototype.normalize = function(){
  return this.visit(this.root);
};

/**
 * Visit Root.
 */

Normalizer.prototype.visitRoot = function(block){
  var ret = new nodes.Root
    , node;

  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    switch (node.nodeName) {
      case 'null':
      case 'expression':
      case 'function':
      case 'jsliteral':
      case 'unit':
        continue;
      default:
        ret.push(this.visit(node));
    }
  }

  return ret;
};

/**
 * Visit Block.
 */

Normalizer.prototype.visitBlock = function(block){
  var ret = new nodes.Block
    , node;

  if (block.hasProperties) {
    for (var i = 0, len = block.nodes.length; i < len; ++i) {
      this.last = len - 1 == i;
      node = block.nodes[i];
      switch (node.nodeName) {
        case 'null':
        case 'expression':
        case 'function':
        case 'jsliteral':
        case 'group':
        case 'unit':
          continue;
        default:
          ret.push(this.visit(node));
      } 
    }
  }

  // nesting
  for (var i = 0, len = block.nodes.length; i < len; ++i) {
    node = block.nodes[i];
    ret.push(this.visit(node));
  }

  return block;
};

/**
 * Visit Group.
 */

Normalizer.prototype.visitGroup = function(group){
  // TODO: clean this mess up
  var stack = this.stack
    , map = this.map
    , self = this;

  stack.push(group.nodes);

  var selectors = this.compileSelectors(stack);

  // map for extension lookup
  selectors.forEach(function(selector){
    map[selector] = map[selector] || [];
    map[selector].push(group);
  });

  // extensions
  this.extend(group, selectors);

  group.block = this.visit(group.block);
  stack.pop();
  return group;
};

/**
 * Visit Media.
 */

Normalizer.prototype.visitMedia = function(media){
  var props = []
    , other = [];

  media.block.nodes.forEach(function(node, i) {
    if ('property' == node.nodeName) {
      props.push(node);
    } else {
      other.push(node);
    }
  });

  // Fake self-referencing group to contain
  // any props that are floating
  // directly on the @media declaration
  if (props.length) {
    var selfLiteral = new nodes.Literal('&');
    selfLiteral.lineno = media.lineno;
    selfLiteral.filename = media.filename;

    var selfSelector = new nodes.Selector(selfLiteral);
    selfSelector.lineno = media.lineno;
    selfSelector.filename = media.filename;
    selfSelector.val = selfLiteral.val;

    var propertyGroup = new nodes.Group;
    propertyGroup.lineno = media.lineno;
    propertyGroup.filename = media.filename;
    
    var propertyBlock = new nodes.Block(media.block, propertyGroup);
    propertyBlock.lineno = media.lineno;
    propertyBlock.filename = media.filename;

    props.forEach(function(prop){
      propertyBlock.push(prop);
    });

    propertyGroup.push(selfSelector);
    propertyGroup.block = propertyBlock;

    media.block.nodes = [];
    media.block.push(propertyGroup);
    other.forEach(function(node){
      media.block.push(node);
    });
  }

  return media;
}

/**
 * Apply `group` extensions.
 *
 * @param {Group} group
 * @param {Array} selectors
 * @api private
 */

Normalizer.prototype.extend = function(group, selectors){
  var map = this.map
    , self = this;

  group.extends.forEach(function(extend){
    var groups = map[extend];
    if (!groups) throw new Error('Failed to @extend "' + extend + '"');
    selectors.forEach(function(selector){
      var node = new nodes.Selector;
      node.val = selector;
      node.inherits = false;
      groups.forEach(function(group){
        if (!group.nodes.some(function(n){ return n.val == selector })) {
          self.extend(group, selectors);
          group.push(node);
        }
      });
    });
  });
};

/**
 * Compile selector strings in `arr` from the bottom-up
 * to produce the selector combinations. For example
 * the following Stylus:
 *
 *    ul
 *      li
 *      p
 *        a
 *          color: red
 *
 * Would return:
 *
 *      [ 'ul li a', 'ul p a' ]
 *
 * @param {Array} arr
 * @return {Array}
 * @api private
 */

Normalizer.prototype.compileSelectors = function(arr){
  // TODO: remove this duplication
  var stack = this.stack
    , self = this
    , selectors = []
    , buf = [];

  function compile(arr, i) {
    if (i) {
      arr[i].forEach(function(selector){
        buf.unshift(selector.val);
        compile(arr, i - 1);
        buf.shift();
      });
    } else {
      arr[0].forEach(function(selector){
        var str = selector.val.trim();
        if (buf.length) {
          for (var i = 0, len = buf.length; i < len; ++i) {
            if (~buf[i].indexOf('&')) {
              str = buf[i].replace(/&/g, str).trim();
            } else {
              str += ' ' + buf[i].trim();
            }
          }
        }
        selectors.push(str.trimRight());
      });
    }
  }

  compile(arr, arr.length - 1);

  return selectors;
};

});

require.define("/lib/middleware.js",function(require,module,exports,__dirname,__filename,process,global){/*!
 * Stylus - middleware
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var stylus = require('./stylus')
  , fs = require('fs')
  , url = require('url')
  , basename = require('path').basename
  , dirname = require('path').dirname
  , mkdirp = require('mkdirp')
  , join = require('path').join
  , debug = require('debug')('stylus:middleware');

/**
 * Import map.
 */

var imports = {};

/**
 * Return Connect middleware with the given `options`.
 *
 * Options:
 *
 *    `force`     Always re-compile
 *    `src`       Source directory used to find .styl files
 *    `dest`      Destination directory used to output .css files
 *                when undefined defaults to `src`.
 *    `compile`   Custom compile function, accepting the arguments
 *                `(str, path)`.
 *    `compress`  Whether the output .css files should be compressed
 *    `firebug`   Emits debug infos in the generated css that can
 *                be used by the FireStylus Firebug plugin
 *    `linenos`   Emits comments in the generated css indicating 
 *                the corresponding stylus line
 *
 * Examples:
 * 
 * Here we set up the custom compile function so that we may
 * set the `compress` option, or define additional functions.
 * 
 * By default the compile function simply sets the `filename`
 * and renders the CSS.
 * 
 *      function compile(str, path) {
 *        return stylus(str)
 *          .set('filename', path)
 *          .set('compress', true);
 *      }
 * 
 * Pass the middleware to Connect, grabbing .styl files from this directory
 * and saving .css files to _./public_. Also supplying our custom `compile` function.
 * 
 * Following that we have a `static()` layer setup to serve the .css
 * files generated by Stylus.
 * 
 *      var app = connect();
 * 
 *      app.middleware({
 *          src: __dirname
 *        , dest: __dirname + '/public'
 *        , compile: compile
 *      })
 * 
 *      app.use(connect.static(__dirname + '/public'));
 * 
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options){
  options = options || {};

  // Accept src/dest dir
  if ('string' == typeof options) {
    options = { src: options };
  }

  // Force compilation
  var force = options.force;

  // Source dir required
  var src = options.src;
  if (!src) throw new Error('stylus.middleware() requires "src" directory');

  // Default dest dir to source
  var dest = options.dest
    ? options.dest
    : src;

  // Default compile callback
  options.compile = options.compile || function(str, path){
    return stylus(str)
      .set('filename', path)
      .set('compress', options.compress)
      .set('firebug', options.firebug)
      .set('linenos', options.linenos);
  };

  // Middleware
  return function stylus(req, res, next){
    if ('GET' != req.method && 'HEAD' != req.method) return next();
    var path = url.parse(req.url).pathname;
    if (/\.css$/.test(path)) {
      var cssPath = join(dest, path)
        , stylusPath = join(src, path.replace('.css', '.styl'));

      // Ignore ENOENT to fall through as 404
      function error(err) {
        next('ENOENT' == err.code
          ? null
          : err);
      }

      // Force
      if (force) return compile();

      // Compile to cssPath
      function compile() {
        debug('read %s', cssPath);
        fs.readFile(stylusPath, 'utf8', function(err, str){
          if (err) return error(err);
          var style = options.compile(str, stylusPath);
          var paths = style.options._imports = [];
          delete imports[stylusPath];
          style.render(function(err, css){
            if (err) return next(err);
            debug('render %s', stylusPath);
            imports[stylusPath] = paths;
            mkdirp(dirname(cssPath), 0700, function(err){
              if (err) return error(err);
              fs.writeFile(cssPath, css, 'utf8', next);
            });
          });
        });
      }

      // Re-compile on server restart, disregarding
      // mtimes since we need to map imports
      if (!imports[stylusPath]) return compile();

      // Compare mtimes
      fs.stat(stylusPath, function(err, stylusStats){
        if (err) return error(err);
        fs.stat(cssPath, function(err, cssStats){
          // CSS has not been compiled, compile it!
          if (err) {
            if ('ENOENT' == err.code) {
              debug('not found %s', cssPath);
              compile();
            } else {
              next(err);
            }
          } else {
            // Source has changed, compile it
            if (stylusStats.mtime > cssStats.mtime) {
              debug('modified %s', cssPath);
              compile();
            // Already compiled, check imports
            } else {
              checkImports(stylusPath, function(changed){
                if (debug && changed.length) {
                  changed.forEach(function(path) {
                    debug('modified import %s', path);
                  });
                }
                changed.length ? compile() : next();
              });
            }
          }
        });
      });
    } else {
      next();
    }
  }
};

/**
 * Check `path`'s imports to see if they have been altered.
 *
 * @param {String} path
 * @param {Function} fn
 * @api private
 */

function checkImports(path, fn) {
  var nodes = imports[path];
  if (!nodes) return fn();
  if (!nodes.length) return fn();

  var pending = nodes.length
    , changed = [];

  nodes.forEach(function(imported){
    fs.stat(imported.path, function(err, stat){
      // error or newer mtime
      if (err || !imported.mtime || stat.mtime > imported.mtime) {
        changed.push(imported.path);
      }
      --pending || fn(changed);
    });
  });
}

});

require.define("/lib/stylus.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Renderer = require('./renderer')
  , Parser = require('./parser')
  , nodes = require('./nodes')
  , utils = require('./utils');

/**
 * Export render as the module.
 */

exports = module.exports = render;

/**
 * Library version.
 */

exports.version = '0.31.0';

/**
 * Expose nodes.
 */

exports.nodes = nodes;

/**
 * Expose BIFs.
 */

exports.functions = require('./functions');

/**
 * Expose utils.
 */

exports.utils = require('./utils');

/**
 * Expose middleware.
 */

exports.middleware = require('./middleware');

/**
 * Expose constructors.
 */

exports.Visitor = require('./visitor');
exports.Parser = require('./parser');
exports.Evaluator = require('./visitor/evaluator');
exports.Compiler = require('./visitor/compiler');

/**
 * Convert the given `css` to `stylus` source.
 *
 * @param {String} css
 * @return {String}
 * @api public
 */

exports.convertCSS = require('./convert/css');

/**
 * Render the given `str` with `options` and callback `fn(err, css)`.
 *
 * @param {String} str
 * @param {Object|Function} options
 * @param {Function} fn
 * @api public
 */

exports.render = function(str, options, fn){
  if ('function' == typeof options) fn = options, options = {};
  new Renderer(str, options).render(fn);
};

/**
 * Return a new `Renderer` for the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Renderer}
 * @api public
 */

function render(str, options) {
  return new Renderer(str, options);
}

/**
 * Expose optional functions.
 */

exports.url = require('./functions/url');

});

require.define("/lib/convert/css.js",function(require,module,exports,__dirname,__filename,process,global){/*!
 * Stylus - css to stylus conversion
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Convert the given `css` to stylus source.
 *
 * @param {String} css
 * @return {String}
 * @api public
 */

module.exports = function(css){
  return new Converter(css).stylus();
};

/**
 * Initialize a new `Converter` with the given `css`.
 *
 * @param {String} css
 * @api private
 */

function Converter(css) {
  var cssom = require('cssom');
  this.css = css;
  this.types = cssom.CSSRule;
  this.root = cssom.parse(css);
  this.indents = 0;
}

/**
 * Convert to stylus.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.stylus = function(){
  return this.visitRules(this.root.cssRules);
};

/**
 * Return indent string.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.__defineGetter__('indent', function(){
  return Array(this.indents + 1).join('  ');
});

/**
 * Visit `node`.
 *
 * @param {CSSRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visit = function(node){
  switch (node.type) {
    case this.types.STYLE_RULE:
      return this.visitStyle(node);
    case this.types.MEDIA_RULE:
      return this.visitMedia(node);
  }
};

/**
 * Visit the rules on `node`.
 *
 * @param {CSSRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitRules = function(node){
  var buf = '';
  for (var i = 0, len = node.length; i < len; ++i) {
    buf += this.visit(node[i]);
  }
  return buf;
};

/**
 * Visit CSSMediaRule `node`.
 *
 * @param {CSSMediaRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitMedia = function(node){
  var buf = this.indent + '@media ';
  for (var i = 0, len = node.media.length; i < len; ++i) {
    buf += node.media[i];
  }
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.cssRules);
  --this.indents;
  return buf;
};

/**
 * Visit CSSStyleRule `node`.`
 *
 * @param {CSSStyleRule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitStyle = function(node){
  var buf = this.indent + node.selectorText + '\n';
  ++this.indents;
  for (var i = 0, len = node.style.length; i < len; ++i) {
    var prop = node.style[i]
      , val = node.style[prop]
      , importance = node.style['_importants'][prop] ? ' !important' : '';
    if (prop) {
      buf += this.indent + prop + ': ' + val + importance + '\n';
    }
  }
  --this.indents;
  return buf + '\n';
};
});

require.define("/node_modules/cssom/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"./lib/index.js"}
});

require.define("/node_modules/cssom/lib/index.js",function(require,module,exports,__dirname,__filename,process,global){'use strict';

exports.CSSStyleDeclaration = require('./CSSStyleDeclaration').CSSStyleDeclaration;
exports.CSSRule = require('./CSSRule').CSSRule;
exports.CSSStyleRule = require('./CSSStyleRule').CSSStyleRule;
exports.MediaList = require('./MediaList').MediaList;
exports.CSSMediaRule = require('./CSSMediaRule').CSSMediaRule;
exports.CSSImportRule = require('./CSSImportRule').CSSImportRule;
exports.CSSFontFaceRule = require('./CSSFontFaceRule').CSSFontFaceRule;
exports.StyleSheet = require('./StyleSheet').StyleSheet;
exports.CSSStyleSheet = require('./CSSStyleSheet').CSSStyleSheet;
exports.CSSKeyframesRule = require('./CSSKeyframesRule').CSSKeyframesRule;
exports.CSSKeyframeRule = require('./CSSKeyframeRule').CSSKeyframeRule;
exports.parse = require('./parse').parse;
exports.clone = require('./clone').clone;

});

require.define("/node_modules/cssom/lib/CSSStyleDeclaration.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration
 */
CSSOM.CSSStyleDeclaration = function CSSStyleDeclaration(){
	this.length = 0;
	this.parentRule = null;

	// NON-STANDARD
	this._importants = {};
};


CSSOM.CSSStyleDeclaration.prototype = {

	constructor: CSSOM.CSSStyleDeclaration,

	/**
	 *
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-getPropertyValue
	 * @return {string} the value of the property if it has been explicitly set for this declaration block.
	 * Returns the empty string if the property has not been set.
	 */
	getPropertyValue: function(name) {
		return this[name] || "";
	},

	/**
	 *
	 * @param {string} name
	 * @param {string} value
	 * @param {string} [priority=null] "important" or null
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-setProperty
	 */
	setProperty: function(name, value, priority) {
		if (this[name]) {
			// Property already exist. Overwrite it.
			var index = Array.prototype.indexOf.call(this, name);
			if (index < 0) {
				this[this.length] = name;
				this.length++;
			}
		} else {
			// New property.
			this[this.length] = name;
			this.length++;
		}
		this[name] = value;
		this._importants[name] = priority;
	},

	/**
	 *
	 * @param {string} name
	 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration-removeProperty
	 * @return {string} the value of the property if it has been explicitly set for this declaration block.
	 * Returns the empty string if the property has not been set or the property name does not correspond to a known CSS property.
	 */
	removeProperty: function(name) {
		if (!(name in this)) {
			return "";
		}
		var index = Array.prototype.indexOf.call(this, name);
		if (index < 0) {
			return "";
		}
		var prevValue = this[name];
		this[name] = "";

		// That's what WebKit and Opera do
		Array.prototype.splice.call(this, index, 1);

		// That's what Firefox does
		//this[index] = ""

		return prevValue;
	},

	getPropertyCSSValue: function() {
		//FIXME
	},

	/**
	 *
	 * @param {String} name
	 */
	getPropertyPriority: function(name) {
		return this._importants[name] || "";
	},


	/**
	 *   element.style.overflow = "auto"
	 *   element.style.getPropertyShorthand("overflow-x")
	 *   -> "overflow"
	 */
	getPropertyShorthand: function() {
		//FIXME
	},

	isPropertyImplicit: function() {
		//FIXME
	},

	// Doesn't work in IE < 9
	get cssText(){
		var properties = [];
		for (var i=0, length=this.length; i < length; ++i) {
			var name = this[i];
			var value = this.getPropertyValue(name);
			var priority = this.getPropertyPriority(name);
			if (priority) {
				priority = " !" + priority;
			}
			properties[i] = name + ": " + value + priority + ";";
		}
		return properties.join(" ");
	},

	set cssText(cssText){
		var i, name;
		for (i = this.length; i--;) {
			name = this[i];
			this[name] = "";
		}
		Array.prototype.splice.call(this, 0, this.length);
		this._importants = {};

		var dummyRule = CSSOM.parse('#bogus{' + cssText + '}').cssRules[0].style;
		var length = dummyRule.length;
		for (i = 0; i < length; ++i) {
			name = dummyRule[i];
			this.setProperty(dummyRule[i], dummyRule.getPropertyValue(name), dummyRule.getPropertyPriority(name));
		}
	}
};


//.CommonJS
exports.CSSStyleDeclaration = CSSOM.CSSStyleDeclaration;
CSSOM.parse = require('./parse').parse; // Cannot be included sooner due to the mutual dependency between parse.js and CSSStyleDeclaration.js
///CommonJS

});

require.define("/node_modules/cssom/lib/parse.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @param {string} token
 */
CSSOM.parse = function parse(token) {

	var i = 0;

	/**
	  "before-selector" or
	  "selector" or
	  "atRule" or
	  "atBlock" or
	  "before-name" or
	  "name" or
	  "before-value" or
	  "value"
	*/
	var state = "before-selector";

	var index;
	var buffer = "";

	var SIGNIFICANT_WHITESPACE = {
		"selector": true,
		"value": true,
		"atRule": true,
		"importRule-begin": true,
		"importRule": true,
		"atBlock": true
	};

	var styleSheet = new CSSOM.CSSStyleSheet;

	// @type CSSStyleSheet|CSSMediaRule|CSSFontFaceRule|CSSKeyframesRule
	var currentScope = styleSheet;

	// @type CSSMediaRule|CSSKeyframesRule
	var parentRule;

	var selector, name, value, priority="", styleRule, mediaRule, importRule, fontFaceRule, keyframesRule, keyframeRule;

	var atKeyframesRegExp = /@(-(?:\w+-)+)?keyframes/g;

	var parseError = function(message) {
		var lines = token.substring(0, i).split('\n');
		var lineCount = lines.length;
		var charCount = lines.pop().length + 1;
		var error = new Error(message + ' (line ' + lineCount + ', char ' + charCount + ')');
		error.line = lineCount;
		error.char = charCount;
		error.styleSheet = styleSheet;
		throw error;
	};

	for (var character; character = token.charAt(i); i++) {

		switch (character) {

		case " ":
		case "\t":
		case "\r":
		case "\n":
		case "\f":
			if (SIGNIFICANT_WHITESPACE[state]) {
				buffer += character;
			}
			break;

		// String
		case '"':
			index = token.indexOf('"', i + 1) + 1;
			if (!index) {
				parseError('Unmatched "');
			}
			buffer += token.slice(i, index);
			i = index - 1;
			switch (state) {
				case 'before-value':
					state = 'value';
					break;
				case 'importRule-begin':
					state = 'importRule';
					break;
			}
			break;

		case "'":
			index = token.indexOf("'", i + 1) + 1;
			if (!index) {
				parseError("Unmatched '");
			}
			buffer += token.slice(i, index);
			i = index - 1;
			switch (state) {
				case 'before-value':
					state = 'value';
					break;
				case 'importRule-begin':
					state = 'importRule';
					break;
			}
			break;

		// Comment
		case "/":
			if (token.charAt(i + 1) === "*") {
				i += 2;
				index = token.indexOf("*/", i);
				if (index === -1) {
					parseError("Missing */");
				} else {
					i = index + 1;
				}
			} else {
				buffer += character;
			}
			if (state === "importRule-begin") {
				buffer += " ";
				state = "importRule";
			}
			break;

		// At-rule
		case "@":
			if (token.indexOf("@media", i) === i) {
				state = "atBlock";
				mediaRule = new CSSOM.CSSMediaRule;
				mediaRule.__starts = i;
				i += "media".length;
				buffer = "";
				break;
			} else if (token.indexOf("@import", i) === i) {
				state = "importRule-begin";
				i += "import".length;
				buffer += "@import";
				break;
			} else if (token.indexOf("@font-face", i) === i) {
				state = "fontFaceRule-begin";
				i += "font-face".length;
				fontFaceRule = new CSSOM.CSSFontFaceRule;
				fontFaceRule.__starts = i;
				buffer = "";
				break;
			} else {
				atKeyframesRegExp.lastIndex = i;
				var matchKeyframes = atKeyframesRegExp.exec(token);
				if (matchKeyframes && matchKeyframes.index === i) {
					state = "keyframesRule-begin";
					keyframesRule = new CSSOM.CSSKeyframesRule;
					keyframesRule.__starts = i;
					keyframesRule._vendorPrefix = matchKeyframes[1]; // Will come out as undefined if no prefix was found
					i += matchKeyframes[0].length - 1;
					buffer = "";
					break;
				} else if (state == "selector") {
					state = "atRule";
				}
			}
			buffer += character;
			break;

		case "{":
			if (state === "selector" || state === "atRule") {
				styleRule.selectorText = buffer.trim();
				styleRule.style.__starts = i;
				buffer = "";
				state = "before-name";
			} else if (state === "atBlock") {
				mediaRule.media.mediaText = buffer.trim();
				currentScope = parentRule = mediaRule;
				mediaRule.parentStyleSheet = styleSheet;
				buffer = "";
				state = "before-selector";
			} else if (state === "fontFaceRule-begin") {
				if (parentRule) {
					fontFaceRule.parentRule = parentRule;
				}
				fontFaceRule.parentStyleSheet = styleSheet;
				styleRule = fontFaceRule;
				buffer = "";
				state = "before-name";
			} else if (state === "keyframesRule-begin") {
				keyframesRule.name = buffer.trim();
				if (parentRule) {
					keyframesRule.parentRule = parentRule;
				}
				keyframesRule.parentStyleSheet = styleSheet;
				currentScope = parentRule = keyframesRule;
				buffer = "";
				state = "keyframeRule-begin";
			} else if (state === "keyframeRule-begin") {
				styleRule = new CSSOM.CSSKeyframeRule;
				styleRule.keyText = buffer.trim();
				styleRule.__starts = i;
				buffer = "";
				state = "before-name";
			}
			break;

		case ":":
			if (state === "name") {
				name = buffer.trim();
				buffer = "";
				state = "before-value";
			} else {
				buffer += character;
			}
			break;

		case '(':
			if (state === 'value') {
				index = token.indexOf(')', i + 1);
				if (index === -1) {
					parseError('Unmatched "("');
				}
				buffer += token.slice(i, index + 1);
				i = index;
			} else {
				buffer += character;
			}
			break;

		case "!":
			if (state === "value" && token.indexOf("!important", i) === i) {
				priority = "important";
				i += "important".length;
			} else {
				buffer += character;
			}
			break;

		case ";":
			switch (state) {
				case "value":
					styleRule.style.setProperty(name, buffer.trim(), priority);
					priority = "";
					buffer = "";
					state = "before-name";
					break;
				case "atRule":
					buffer = "";
					state = "before-selector";
					break;
				case "importRule":
					importRule = new CSSOM.CSSImportRule;
					importRule.parentStyleSheet = importRule.styleSheet.parentStyleSheet = styleSheet;
					importRule.cssText = buffer + character;
					styleSheet.cssRules.push(importRule);
					buffer = "";
					state = "before-selector";
					break;
				default:
					buffer += character;
					break;
			}
			break;

		case "}":
			switch (state) {
				case "value":
					styleRule.style.setProperty(name, buffer.trim(), priority);
					priority = "";
				case "before-name":
				case "name":
					styleRule.__ends = i + 1;
					if (parentRule) {
						styleRule.parentRule = parentRule;
					}
					styleRule.parentStyleSheet = styleSheet;
					currentScope.cssRules.push(styleRule);
					buffer = "";
					if (currentScope.constructor === CSSOM.CSSKeyframesRule) {
						state = "keyframeRule-begin";
					} else {
						state = "before-selector";
					}
					break;
				case "keyframeRule-begin":
				case "before-selector":
				case "selector":
					// End of media rule.
					if (!parentRule) {
						parseError("Unexpected }");
					}
					currentScope.__ends = i + 1;
					// Nesting rules aren't supported yet
					styleSheet.cssRules.push(currentScope);
					currentScope = styleSheet;
					parentRule = null;
					buffer = "";
					state = "before-selector";
					break;
			}
			break;

		default:
			switch (state) {
				case "before-selector":
					state = "selector";
					styleRule = new CSSOM.CSSStyleRule;
					styleRule.__starts = i;
					break;
				case "before-name":
					state = "name";
					break;
				case "before-value":
					state = "value";
					break;
				case "importRule-begin":
					state = "importRule";
					break;
			}
			buffer += character;
			break;
		}
	}

	return styleSheet;
};


//.CommonJS
exports.parse = CSSOM.parse;
// The following modules cannot be included sooner due to the mutual dependency with parse.js
CSSOM.CSSStyleSheet = require("./CSSStyleSheet").CSSStyleSheet;
CSSOM.CSSStyleRule = require("./CSSStyleRule").CSSStyleRule;
CSSOM.CSSImportRule = require("./CSSImportRule").CSSImportRule;
CSSOM.CSSMediaRule = require("./CSSMediaRule").CSSMediaRule;
CSSOM.CSSFontFaceRule = require("./CSSFontFaceRule").CSSFontFaceRule;
CSSOM.CSSStyleDeclaration = require('./CSSStyleDeclaration').CSSStyleDeclaration;
CSSOM.CSSKeyframeRule = require('./CSSKeyframeRule').CSSKeyframeRule;
CSSOM.CSSKeyframesRule = require('./CSSKeyframesRule').CSSKeyframesRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSStyleSheet.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	StyleSheet: require("./StyleSheet").StyleSheet,
	CSSStyleRule: require("./CSSStyleRule").CSSStyleRule
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet
 */
CSSOM.CSSStyleSheet = function CSSStyleSheet() {
	CSSOM.StyleSheet.call(this);
	this.cssRules = [];
};


CSSOM.CSSStyleSheet.prototype = new CSSOM.StyleSheet;
CSSOM.CSSStyleSheet.prototype.constructor = CSSOM.CSSStyleSheet;


/**
 * Used to insert a new rule into the style sheet. The new rule now becomes part of the cascade.
 *
 *   sheet = new Sheet("body {margin: 0}")
 *   sheet.toString()
 *   -> "body{margin:0;}"
 *   sheet.insertRule("img {border: none}", 0)
 *   -> 0
 *   sheet.toString()
 *   -> "img{border:none;}body{margin:0;}"
 *
 * @param {string} rule
 * @param {number} index
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-insertRule
 * @return {number} The index within the style sheet's rule collection of the newly inserted rule.
 */
CSSOM.CSSStyleSheet.prototype.insertRule = function(rule, index) {
	if (index < 0 || index > this.cssRules.length) {
		throw new RangeError("INDEX_SIZE_ERR");
	}
	var cssRule = CSSOM.parse(rule).cssRules[0];
	this.cssRules.splice(index, 0, cssRule);
	return index;
};


/**
 * Used to delete a rule from the style sheet.
 *
 *   sheet = new Sheet("img{border:none} body{margin:0}")
 *   sheet.toString()
 *   -> "img{border:none;}body{margin:0;}"
 *   sheet.deleteRule(0)
 *   sheet.toString()
 *   -> "body{margin:0;}"
 *
 * @param {number} index within the style sheet's rule list of the rule to remove.
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleSheet-deleteRule
 */
CSSOM.CSSStyleSheet.prototype.deleteRule = function(index) {
	if (index < 0 || index >= this.cssRules.length) {
		throw new RangeError("INDEX_SIZE_ERR");
	}
	this.cssRules.splice(index, 1);
};


/**
 * NON-STANDARD
 * @return {string} serialize stylesheet
 */
CSSOM.CSSStyleSheet.prototype.toString = function() {
	var result = "";
	var rules = this.cssRules;
	for (var i=0; i<rules.length; i++) {
		result += rules[i].cssText + "\n";
	}
	return result;
};


//.CommonJS
exports.CSSStyleSheet = CSSOM.CSSStyleSheet;
CSSOM.parse = require('./parse').parse; // Cannot be included sooner due to the mutual dependency between parse.js and CSSStyleSheet.js
///CommonJS

});

require.define("/node_modules/cssom/lib/StyleSheet.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#the-stylesheet-interface
 */
CSSOM.StyleSheet = function StyleSheet() {
	this.parentStyleSheet = null;
};


//.CommonJS
exports.StyleSheet = CSSOM.StyleSheet;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSStyleRule.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	CSSStyleDeclaration: require("./CSSStyleDeclaration").CSSStyleDeclaration,
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssstylerule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleRule
 */
CSSOM.CSSStyleRule = function CSSStyleRule() {
	CSSOM.CSSRule.call(this);
	this.selectorText = "";
	this.style = new CSSOM.CSSStyleDeclaration;
	this.style.parentRule = this;
};

CSSOM.CSSStyleRule.prototype = new CSSOM.CSSRule;
CSSOM.CSSStyleRule.prototype.constructor = CSSOM.CSSStyleRule;
CSSOM.CSSStyleRule.prototype.type = 1;

CSSOM.CSSStyleRule.prototype.__defineGetter__("cssText", function() {
	var text;
	if (this.selectorText) {
		text = this.selectorText + " {" + this.style.cssText + "}";
	} else {
		text = "";
	}
	return text;
});

CSSOM.CSSStyleRule.prototype.__defineSetter__("cssText", function(cssText) {
	var rule = CSSOM.CSSStyleRule.parse(cssText);
	this.style = rule.style;
	this.selectorText = rule.selectorText;
});


/**
 * NON-STANDARD
 * lightweight version of parse.js.
 * @param {string} ruleText
 * @return CSSStyleRule
 */
CSSOM.CSSStyleRule.parse = function(ruleText) {
	var i = 0;
	var state = "selector";
	var index;
	var j = i;
	var buffer = "";

	var SIGNIFICANT_WHITESPACE = {
		"selector": true,
		"value": true
	};

	var styleRule = new CSSOM.CSSStyleRule;
	var selector, name, value, priority="";

	for (var character; character = ruleText.charAt(i); i++) {

		switch (character) {

		case " ":
		case "\t":
		case "\r":
		case "\n":
		case "\f":
			if (SIGNIFICANT_WHITESPACE[state]) {
				// Squash 2 or more white-spaces in the row into 1
				switch (ruleText.charAt(i - 1)) {
					case " ":
					case "\t":
					case "\r":
					case "\n":
					case "\f":
						break;
					default:
						buffer += " ";
						break;
				}
			}
			break;

		// String
		case '"':
			j = i + 1;
			index = ruleText.indexOf('"', j) + 1;
			if (!index) {
				throw '" is missing';
			}
			buffer += ruleText.slice(i, index);
			i = index - 1;
			break;

		case "'":
			j = i + 1;
			index = ruleText.indexOf("'", j) + 1;
			if (!index) {
				throw "' is missing";
			}
			buffer += ruleText.slice(i, index);
			i = index - 1;
			break;

		// Comment
		case "/":
			if (ruleText.charAt(i + 1) === "*") {
				i += 2;
				index = ruleText.indexOf("*/", i);
				if (index === -1) {
					throw new SyntaxError("Missing */");
				} else {
					i = index + 1;
				}
			} else {
				buffer += character;
			}
			break;

		case "{":
			if (state === "selector") {
				styleRule.selectorText = buffer.trim();
				buffer = "";
				state = "name";
			}
			break;

		case ":":
			if (state === "name") {
				name = buffer.trim();
				buffer = "";
				state = "value";
			} else {
				buffer += character;
			}
			break;

		case "!":
			if (state === "value" && ruleText.indexOf("!important", i) === i) {
				priority = "important";
				i += "important".length;
			} else {
				buffer += character;
			}
			break;

		case ";":
			if (state === "value") {
				styleRule.style.setProperty(name, buffer.trim(), priority);
				priority = "";
				buffer = "";
				state = "name";
			} else {
				buffer += character;
			}
			break;

		case "}":
			if (state === "value") {
				styleRule.style.setProperty(name, buffer.trim(), priority);
				priority = "";
				buffer = "";
			} else if (state === "name") {
				break;
			} else {
				buffer += character;
			}
			state = "selector";
			break;

		default:
			buffer += character;
			break;

		}
	}

	return styleRule;

};


//.CommonJS
exports.CSSStyleRule = CSSOM.CSSStyleRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSRule.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#the-cssrule-interface
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSRule
 */
CSSOM.CSSRule = function CSSRule() {
	this.parentRule = null;
	this.parentStyleSheet = null;
};

CSSOM.CSSRule.STYLE_RULE = 1;
CSSOM.CSSRule.IMPORT_RULE = 3;
CSSOM.CSSRule.MEDIA_RULE = 4;
CSSOM.CSSRule.FONT_FACE_RULE = 5;
CSSOM.CSSRule.PAGE_RULE = 6;
CSSOM.CSSRule.WEBKIT_KEYFRAMES_RULE = 8;
CSSOM.CSSRule.WEBKIT_KEYFRAME_RULE = 9;

// Obsolete in CSSOM http://dev.w3.org/csswg/cssom/
//CSSOM.CSSRule.UNKNOWN_RULE = 0;
//CSSOM.CSSRule.CHARSET_RULE = 2;

// Never implemented
//CSSOM.CSSRule.VARIABLES_RULE = 7;

CSSOM.CSSRule.prototype = {
	constructor: CSSOM.CSSRule
	//FIXME
};


//.CommonJS
exports.CSSRule = CSSOM.CSSRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSImportRule.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule,
	CSSStyleSheet: require("./CSSStyleSheet").CSSStyleSheet,
	MediaList: require("./MediaList").MediaList
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssimportrule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSImportRule
 */
CSSOM.CSSImportRule = function CSSImportRule() {
	CSSOM.CSSRule.call(this);
	this.href = "";
	this.media = new CSSOM.MediaList;
	this.styleSheet = new CSSOM.CSSStyleSheet;
};

CSSOM.CSSImportRule.prototype = new CSSOM.CSSRule;
CSSOM.CSSImportRule.prototype.constructor = CSSOM.CSSImportRule;
CSSOM.CSSImportRule.prototype.type = 3;
CSSOM.CSSImportRule.prototype.__defineGetter__("cssText", function() {
	var mediaText = this.media.mediaText;
	return "@import url(" + this.href + ")" + (mediaText ? " " + mediaText : "") + ";";
});

CSSOM.CSSImportRule.prototype.__defineSetter__("cssText", function(cssText) {
	var i = 0;

	/**
	 * @import url(partial.css) screen, handheld;
	 *        ||               |
	 *        after-import     media
	 *         |
	 *         url
	 */
	var state = '';

	var buffer = '';
	var index;
	var mediaText = '';
	for (var character; character = cssText.charAt(i); i++) {

		switch (character) {
			case ' ':
			case '\t':
			case '\r':
			case '\n':
			case '\f':
				if (state === 'after-import') {
					state = 'url';
				} else {
					buffer += character;
				}
				break;

			case '@':
				if (!state && cssText.indexOf('@import', i) === i) {
					state = 'after-import';
					i += 'import'.length;
					buffer = '';
				}
				break;

			case 'u':
				if (state === 'url' && cssText.indexOf('url(', i) === i) {
					index = cssText.indexOf(')', i + 1);
					if (index === -1) {
						throw i + ': ")" not found';
					}
					i += 'url('.length;
					var url = cssText.slice(i, index);
					if (url[0] === url[url.length - 1]) {
						if (url[0] === '"' || url[0] === "'") {
							url = url.slice(1, -1);
						}
					}
					this.href = url;
					i = index;
					state = 'media';
				}
				break;

			case '"':
				if (state === 'url') {
					index = cssText.indexOf('"', i + 1);
					if (!index) {
						throw i + ": '\"' not found";
					}
					this.href = cssText.slice(i + 1, index);
					i = index;
					state = 'media';
				}
				break;

			case "'":
				if (state === 'url') {
					index = cssText.indexOf("'", i + 1);
					if (!index) {
						throw i + ': "\'" not found';
					}
					this.href = cssText.slice(i + 1, index);
					i = index;
					state = 'media';
				}
				break;

			case ';':
				if (state === 'media') {
					if (buffer) {
						this.media.mediaText = buffer.trim();
					}
				}
				break;

			default:
				if (state === 'media') {
					buffer += character;
				}
				break;
		}
	}
});


//.CommonJS
exports.CSSImportRule = CSSOM.CSSImportRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/MediaList.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#the-medialist-interface
 */
CSSOM.MediaList = function MediaList(){
	this.length = 0;
};

CSSOM.MediaList.prototype = {

	constructor: CSSOM.MediaList,

	/**
	 * @return {string}
	 */
	get mediaText() {
		return Array.prototype.join.call(this, ", ");
	},

	/**
	 * @param {string} value
	 */
	set mediaText(value) {
		var values = value.split(",");
		var length = this.length = values.length;
		for (var i=0; i<length; i++) {
			this[i] = values[i].trim();
		}
	},

	/**
	 * @param {string} medium
	 */
	appendMedium: function(medium) {
		if (Array.prototype.indexOf.call(this, medium) === -1) {
			this[this.length] = medium;
			this.length++;
		}
	},

	/**
	 * @param {string} medium
	 */
	deleteMedium: function(medium) {
		var index = Array.prototype.indexOf.call(this, medium);
		if (index !== -1) {
			Array.prototype.splice.call(this, index, 1);
		}
	}

};


//.CommonJS
exports.MediaList = CSSOM.MediaList;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSMediaRule.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule,
	MediaList: require("./MediaList").MediaList
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssmediarule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSMediaRule
 */
CSSOM.CSSMediaRule = function CSSMediaRule() {
	CSSOM.CSSRule.call(this);
	this.media = new CSSOM.MediaList;
	this.cssRules = [];
};

CSSOM.CSSMediaRule.prototype = new CSSOM.CSSRule;
CSSOM.CSSMediaRule.prototype.constructor = CSSOM.CSSMediaRule;
CSSOM.CSSMediaRule.prototype.type = 4;
//FIXME
//CSSOM.CSSMediaRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSMediaRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://opensource.apple.com/source/WebCore/WebCore-658.28/css/CSSMediaRule.cpp
CSSOM.CSSMediaRule.prototype.__defineGetter__("cssText", function() {
	var cssTexts = [];
	for (var i=0, length=this.cssRules.length; i < length; i++) {
		cssTexts.push(this.cssRules[i].cssText);
	}
	return "@media " + this.media.mediaText + " {" + cssTexts.join("") + "}";
});


//.CommonJS
exports.CSSMediaRule = CSSOM.CSSMediaRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSFontFaceRule.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	CSSStyleDeclaration: require("./CSSStyleDeclaration").CSSStyleDeclaration,
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#css-font-face-rule
 */
CSSOM.CSSFontFaceRule = function CSSFontFaceRule() {
	CSSOM.CSSRule.call(this);
	this.style = new CSSOM.CSSStyleDeclaration;
	this.style.parentRule = this;
};

CSSOM.CSSFontFaceRule.prototype = new CSSOM.CSSRule;
CSSOM.CSSFontFaceRule.prototype.constructor = CSSOM.CSSFontFaceRule;
CSSOM.CSSFontFaceRule.prototype.type = 5;
//FIXME
//CSSOM.CSSFontFaceRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSFontFaceRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSFontFaceRule.cpp
CSSOM.CSSFontFaceRule.prototype.__defineGetter__("cssText", function() {
	return "@font-face {" + this.style.cssText + "}";
});


//.CommonJS
exports.CSSFontFaceRule = CSSOM.CSSFontFaceRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSKeyframeRule.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule,
	CSSStyleDeclaration: require('./CSSStyleDeclaration').CSSStyleDeclaration
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/css3-animations/#DOM-CSSKeyframeRule
 */
CSSOM.CSSKeyframeRule = function CSSKeyframeRule() {
	CSSOM.CSSRule.call(this);
	this.keyText = '';
	this.style = new CSSOM.CSSStyleDeclaration;
	this.style.parentRule = this;
};

CSSOM.CSSKeyframeRule.prototype = new CSSOM.CSSRule;
CSSOM.CSSKeyframeRule.prototype.constructor = CSSOM.CSSKeyframeRule;
CSSOM.CSSKeyframeRule.prototype.type = 9;
//FIXME
//CSSOM.CSSKeyframeRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSKeyframeRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSKeyframeRule.cpp
CSSOM.CSSKeyframeRule.prototype.__defineGetter__("cssText", function() {
	return this.keyText + " {" + this.style.cssText + "} ";
});


//.CommonJS
exports.CSSKeyframeRule = CSSOM.CSSKeyframeRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/CSSKeyframesRule.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule
};
///CommonJS


/**
 * @constructor
 * @see http://www.w3.org/TR/css3-animations/#DOM-CSSKeyframesRule
 */
CSSOM.CSSKeyframesRule = function CSSKeyframesRule() {
	CSSOM.CSSRule.call(this);
	this.name = '';
	this.cssRules = [];
};

CSSOM.CSSKeyframesRule.prototype = new CSSOM.CSSRule;
CSSOM.CSSKeyframesRule.prototype.constructor = CSSOM.CSSKeyframesRule;
CSSOM.CSSKeyframesRule.prototype.type = 8;
//FIXME
//CSSOM.CSSKeyframesRule.prototype.insertRule = CSSStyleSheet.prototype.insertRule;
//CSSOM.CSSKeyframesRule.prototype.deleteRule = CSSStyleSheet.prototype.deleteRule;

// http://www.opensource.apple.com/source/WebCore/WebCore-955.66.1/css/WebKitCSSKeyframesRule.cpp
CSSOM.CSSKeyframesRule.prototype.__defineGetter__("cssText", function() {
	var cssTexts = [];
	for (var i=0, length=this.cssRules.length; i < length; i++) {
		cssTexts.push("  " + this.cssRules[i].cssText);
	}
	return "@" + (this._vendorPrefix || '') + "keyframes " + this.name + " { \n" + cssTexts.join("\n") + "\n}";
});


//.CommonJS
exports.CSSKeyframesRule = CSSOM.CSSKeyframesRule;
///CommonJS

});

require.define("/node_modules/cssom/lib/clone.js",function(require,module,exports,__dirname,__filename,process,global){//.CommonJS
var CSSOM = {
	CSSStyleSheet: require("./CSSStyleSheet").CSSStyleSheet,
	CSSStyleRule: require("./CSSStyleRule").CSSStyleRule,
	CSSMediaRule: require("./CSSMediaRule").CSSMediaRule,
	CSSStyleDeclaration: require("./CSSStyleDeclaration").CSSStyleDeclaration,
	CSSKeyframeRule: require('./CSSKeyframeRule').CSSKeyframeRule,
	CSSKeyframesRule: require('./CSSKeyframesRule').CSSKeyframesRule
};
///CommonJS


/**
 * Produces a deep copy of stylesheet — the instance variables of stylesheet are copied recursively.
 * @param {CSSStyleSheet|CSSOM.CSSStyleSheet} stylesheet
 * @nosideeffects
 * @return {CSSOM.CSSStyleSheet}
 */
CSSOM.clone = function clone(stylesheet) {

	var cloned = new CSSOM.CSSStyleSheet;

	var rules = stylesheet.cssRules;
	if (!rules) {
		return cloned;
	}

	var RULE_TYPES = {
		1: CSSOM.CSSStyleRule,
		4: CSSOM.CSSMediaRule,
		//3: CSSOM.CSSImportRule,
		//5: CSSOM.CSSFontFaceRule,
		//6: CSSOM.CSSPageRule,
		8: CSSOM.CSSKeyframesRule,
		9: CSSOM.CSSKeyframeRule
	};

	for (var i=0, rulesLength=rules.length; i < rulesLength; i++) {
		var rule = rules[i];
		var ruleClone = cloned.cssRules[i] = new RULE_TYPES[rule.type];

		var style = rule.style;
		if (style) {
			var styleClone = ruleClone.style = new CSSOM.CSSStyleDeclaration;
			for (var j=0, styleLength=style.length; j < styleLength; j++) {
				var name = styleClone[j] = style[j];
				styleClone[name] = style[name];
				styleClone._importants[name] = style.getPropertyPriority(name);
			}
			styleClone.length = style.length;
		}

		if (rule.hasOwnProperty('keyText')) {
			ruleClone.keyText = rule.keyText;
		}

		if (rule.hasOwnProperty('selectorText')) {
			ruleClone.selectorText = rule.selectorText;
		}

		if (rule.hasOwnProperty('mediaText')) {
			ruleClone.mediaText = rule.mediaText;
		}

		if (rule.hasOwnProperty('cssRules')) {
			ruleClone.cssRules = clone(rule).cssRules;
		}
	}

	return cloned;

};

//.CommonJS
exports.clone = CSSOM.clone;
///CommonJS

});

require.define("/lib/functions/url.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus - plugin - url
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Compiler = require('../visitor/compiler')
  , nodes = require('../nodes')
  , parse = require('url').parse
  , extname = require('path').extname
  , utils = require('../utils')
  , fs = require('fs');

/**
 * Mime table.
 */

var mimes = {
    '.gif': 'image/gif'
  , '.png': 'image/png'
  , '.jpg': 'image/jpeg'
  , '.jpeg': 'image/jpeg'
  , '.svg': 'image/svg+xml'
};

/**
 * Return a url() function with the given `options`.
 *
 * Options:
 *
 *    - `limit` bytesize limit defaulting to 30Kb
 *    - `paths` image resolution path(s), merged with general lookup paths
 *
 * Examples:
 *
 *    stylus(str)
 *      .set('filename', __dirname + '/css/test.styl')
 *      .define('url', stylus.url({ paths: [__dirname + '/public'] }))
 *      .render(function(err, css){ ... })
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
  options = options || {};

  var _paths = options.paths || [];
  var sizeLimit = null != options.limit ? options.limit : 30000;

  function fn(url){
    // Compile the url
    var compiler = new Compiler(url);
    compiler.isURL = true;
    url = url.nodes.map(function(node){
      return compiler.visit(node);
    }).join('');

    // Parse literal
    url = parse(url);
    var ext = extname(url.pathname)
      , mime = mimes[ext]
      , literal = new nodes.Literal('url("' + url.href + '")')
      , paths = _paths.concat(this.paths)
      , buf;

    // Not supported
    if (!mime) return literal;

    // Absolute
    if (url.protocol) return literal;

    // Lookup
    var found = utils.lookup(url.pathname, paths);

    // Failed to lookup
    if (!found) return literal;

    // Read data
    buf = fs.readFileSync(found);

    // To large
    if (false !== sizeLimit && buf.length > sizeLimit) return literal;

    // Encode
    return new nodes.Literal('url("data:' + mime + ';base64,' + buf.toString('base64') + '")');
  };

  fn.raw = true;
  return fn;
};

});

require.define("url",function(require,module,exports,__dirname,__filename,process,global){var punycode = { encode : function (s) { return s } };

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

function arrayIndexOf(array, subject) {
    for (var i = 0, j = array.length; i < j; i++) {
        if(array[i] == subject) return i;
    }
    return -1;
}

var objectKeys = Object.keys || function objectKeys(object) {
    if (object !== Object(object)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in object) if (object.hasOwnProperty(key)) keys[keys.length] = key;
    return keys;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]+$/,
    // RFC 2396: characters reserved for delimiting URLs.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '~', '[', ']', '`'].concat(delims),
    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''],
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#']
      .concat(unwise).concat(autoEscape),
    nonAuthChars = ['/', '@', '?', '#'].concat(delims),
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-zA-Z0-9][a-z0-9A-Z_-]{0,62}$/,
    hostnamePartStart = /^([a-zA-Z0-9][a-z0-9A-Z_-]{0,62})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always have a path component.
    pathedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof(url) === 'object' && url.href) return url;

  if (typeof url !== 'string') {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var out = {},
      rest = url;

  // cut off any delimiters.
  // This is to support parse stuff like "<http://foo.com>"
  for (var i = 0, l = rest.length; i < l; i++) {
    if (arrayIndexOf(delims, rest.charAt(i)) === -1) break;
  }
  if (i !== 0) rest = rest.substr(i);


  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    out.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      out.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    // don't enforce full RFC correctness, just be unstupid about it.

    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the first @ sign, unless some non-auth character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    var atSign = arrayIndexOf(rest, '@');
    if (atSign !== -1) {
      // there *may be* an auth
      var hasAuth = true;
      for (var i = 0, l = nonAuthChars.length; i < l; i++) {
        var index = arrayIndexOf(rest, nonAuthChars[i]);
        if (index !== -1 && index < atSign) {
          // not a valid auth.  Something like http://foo.com/bar@baz/
          hasAuth = false;
          break;
        }
      }
      if (hasAuth) {
        // pluck off the auth portion.
        out.auth = rest.substr(0, atSign);
        rest = rest.substr(atSign + 1);
      }
    }

    var firstNonHost = -1;
    for (var i = 0, l = nonHostChars.length; i < l; i++) {
      var index = arrayIndexOf(rest, nonHostChars[i]);
      if (index !== -1 &&
          (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
    }

    if (firstNonHost !== -1) {
      out.host = rest.substr(0, firstNonHost);
      rest = rest.substr(firstNonHost);
    } else {
      out.host = rest;
      rest = '';
    }

    // pull out port.
    var p = parseHost(out.host);
    var keys = objectKeys(p);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      out[key] = p[key];
    }

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    out.hostname = out.hostname || '';

    // validate a little.
    if (out.hostname.length > hostnameMaxLen) {
      out.hostname = '';
    } else {
      var hostparts = out.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            out.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    // hostnames are always lower case.
    out.hostname = out.hostname.toLowerCase();

    // IDNA Support: Returns a puny coded representation of "domain".
    // It only converts the part of the domain name that
    // has non ASCII characters. I.e. it dosent matter if
    // you call it with a domain that already is in ASCII.
    var domainArray = out.hostname.split('.');
    var newOut = [];
    for (var i = 0; i < domainArray.length; ++i) {
      var s = domainArray[i];
      newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
          'xn--' + punycode.encode(s) : s);
    }
    out.hostname = newOut.join('.');

    out.host = (out.hostname || '') +
        ((out.port) ? ':' + out.port : '');
    out.href += out.host;
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }

    // Now make sure that delims never appear in a url.
    var chop = rest.length;
    for (var i = 0, l = delims.length; i < l; i++) {
      var c = arrayIndexOf(rest, delims[i]);
      if (c !== -1) {
        chop = Math.min(c, chop);
      }
    }
    rest = rest.substr(0, chop);
  }


  // chop off from the tail first.
  var hash = arrayIndexOf(rest, '#');
  if (hash !== -1) {
    // got a fragment string.
    out.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = arrayIndexOf(rest, '?');
  if (qm !== -1) {
    out.search = rest.substr(qm);
    out.query = rest.substr(qm + 1);
    if (parseQueryString) {
      out.query = querystring.parse(out.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    out.search = '';
    out.query = {};
  }
  if (rest) out.pathname = rest;
  if (slashedProtocol[proto] &&
      out.hostname && !out.pathname) {
    out.pathname = '/';
  }

  //to support http.request
  if (out.pathname || out.search) {
    out.path = (out.pathname ? out.pathname : '') +
               (out.search ? out.search : '');
  }

  // finally, reconstruct the href based on what has been validated.
  out.href = urlFormat(out);
  return out;
}

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (typeof(obj) === 'string') obj = urlParse(obj);

  var auth = obj.auth || '';
  if (auth) {
    auth = auth.split('@').join('%40');
    for (var i = 0, l = nonAuthChars.length; i < l; i++) {
      var nAC = nonAuthChars[i];
      auth = auth.split(nAC).join(encodeURIComponent(nAC));
    }
    auth += '@';
  }

  var protocol = obj.protocol || '',
      host = (obj.host !== undefined) ? auth + obj.host :
          obj.hostname !== undefined ? (
              auth + obj.hostname +
              (obj.port ? ':' + obj.port : '')
          ) :
          false,
      pathname = obj.pathname || '',
      query = obj.query &&
              ((typeof obj.query === 'object' &&
                objectKeys(obj.query).length) ?
                 querystring.stringify(obj.query) :
                 '') || '',
      search = obj.search || (query && ('?' + query)) || '',
      hash = obj.hash || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (obj.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  return protocol + host + pathname + search + hash;
}

function urlResolve(source, relative) {
  return urlFormat(urlResolveObject(source, relative));
}

function urlResolveObject(source, relative) {
  if (!source) return relative;

  source = urlParse(urlFormat(source), false, true);
  relative = urlParse(urlFormat(relative), false, true);

  // hash is always overridden, no matter what.
  source.hash = relative.hash;

  if (relative.href === '') {
    source.href = urlFormat(source);
    return source;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    relative.protocol = source.protocol;
    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[relative.protocol] &&
        relative.hostname && !relative.pathname) {
      relative.path = relative.pathname = '/';
    }
    relative.href = urlFormat(relative);
    return relative;
  }

  if (relative.protocol && relative.protocol !== source.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      relative.href = urlFormat(relative);
      return relative;
    }
    source.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      relative.pathname = relPath.join('/');
    }
    source.pathname = relative.pathname;
    source.search = relative.search;
    source.query = relative.query;
    source.host = relative.host || '';
    source.auth = relative.auth;
    source.hostname = relative.hostname || relative.host;
    source.port = relative.port;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.slashes = source.slashes || relative.slashes;
    source.href = urlFormat(source);
    return source;
  }

  var isSourceAbs = (source.pathname && source.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host !== undefined ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (source.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = source.pathname && source.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = source.protocol &&
          !slashedProtocol[source.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // source.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {

    delete source.hostname;
    delete source.port;
    if (source.host) {
      if (srcPath[0] === '') srcPath[0] = source.host;
      else srcPath.unshift(source.host);
    }
    delete source.host;
    if (relative.protocol) {
      delete relative.hostname;
      delete relative.port;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      delete relative.host;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    source.host = (relative.host || relative.host === '') ?
                      relative.host : source.host;
    source.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : source.hostname;
    source.search = relative.search;
    source.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    source.search = relative.search;
    source.query = relative.query;
  } else if ('search' in relative) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      source.hostname = source.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = source.host && arrayIndexOf(source.host, '@') > 0 ?
                       source.host.split('@') : false;
      if (authInHost) {
        source.auth = authInHost.shift();
        source.host = source.hostname = authInHost.shift();
      }
    }
    source.search = relative.search;
    source.query = relative.query;
    //to support http.request
    if (source.pathname !== undefined || source.search !== undefined) {
      source.path = (source.pathname ? source.pathname : '') +
                    (source.search ? source.search : '');
    }
    source.href = urlFormat(source);
    return source;
  }
  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    delete source.pathname;
    //to support http.request
    if (!source.search) {
      source.path = '/' + source.search;
    } else {
      delete source.path;
    }
    source.href = urlFormat(source);
    return source;
  }
  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (source.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    source.hostname = source.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = source.host && arrayIndexOf(source.host, '@') > 0 ?
                     source.host.split('@') : false;
    if (authInHost) {
      source.auth = authInHost.shift();
      source.host = source.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (source.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  source.pathname = srcPath.join('/');
  //to support request.http
  if (source.pathname !== undefined || source.search !== undefined) {
    source.path = (source.pathname ? source.pathname : '') +
                  (source.search ? source.search : '');
  }
  source.auth = relative.auth || source.auth;
  source.slashes = source.slashes || relative.slashes;
  source.href = urlFormat(source);
  return source;
}

function parseHost(host) {
  var out = {};
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    out.port = port.substr(1);
    host = host.substr(0, host.length - port.length);
  }
  if (host) out.hostname = host;
  return out;
}

});

require.define("querystring",function(require,module,exports,__dirname,__filename,process,global){var isArray = typeof Array.isArray === 'function'
    ? Array.isArray
    : function (xs) {
        return Object.prototype.toString.call(xs) === '[object Array]'
    };

var objectKeys = Object.keys || function objectKeys(object) {
    if (object !== Object(object)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in object) if (object.hasOwnProperty(key)) keys[keys.length] = key;
    return keys;
}


/*!
 * querystring
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.3.1';

/**
 * Object#toString() ref for stringify().
 */

var toString = Object.prototype.toString;

/**
 * Cache non-integer test regexp.
 */

var notint = /[^0-9]/;

/**
 * Parse the given query `str`, returning an object.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str){
  if (null == str || '' == str) return {};

  function promote(parent, key) {
    if (parent[key].length == 0) return parent[key] = {};
    var t = {};
    for (var i in parent[key]) t[i] = parent[key][i];
    parent[key] = t;
    return t;
  }

  return String(str)
    .split('&')
    .reduce(function(ret, pair){
      try{ 
        pair = decodeURIComponent(pair.replace(/\+/g, ' '));
      } catch(e) {
        // ignore
      }

      var eql = pair.indexOf('=')
        , brace = lastBraceInKey(pair)
        , key = pair.substr(0, brace || eql)
        , val = pair.substr(brace || eql, pair.length)
        , val = val.substr(val.indexOf('=') + 1, val.length)
        , parent = ret;

      // ?foo
      if ('' == key) key = pair, val = '';

      // nested
      if (~key.indexOf(']')) {
        var parts = key.split('[')
          , len = parts.length
          , last = len - 1;

        function parse(parts, parent, key) {
          var part = parts.shift();

          // end
          if (!part) {
            if (isArray(parent[key])) {
              parent[key].push(val);
            } else if ('object' == typeof parent[key]) {
              parent[key] = val;
            } else if ('undefined' == typeof parent[key]) {
              parent[key] = val;
            } else {
              parent[key] = [parent[key], val];
            }
          // array
          } else {
            obj = parent[key] = parent[key] || [];
            if (']' == part) {
              if (isArray(obj)) {
                if ('' != val) obj.push(val);
              } else if ('object' == typeof obj) {
                obj[objectKeys(obj).length] = val;
              } else {
                obj = parent[key] = [parent[key], val];
              }
            // prop
            } else if (~part.indexOf(']')) {
              part = part.substr(0, part.length - 1);
              if(notint.test(part) && isArray(obj)) obj = promote(parent, key);
              parse(parts, obj, part);
            // key
            } else {
              if(notint.test(part) && isArray(obj)) obj = promote(parent, key);
              parse(parts, obj, part);
            }
          }
        }

        parse(parts, parent, 'base');
      // optimize
      } else {
        if (notint.test(key) && isArray(parent.base)) {
          var t = {};
          for(var k in parent.base) t[k] = parent.base[k];
          parent.base = t;
        }
        set(parent.base, key, val);
      }

      return ret;
    }, {base: {}}).base;
};

/**
 * Turn the given `obj` into a query string
 *
 * @param {Object} obj
 * @return {String}
 * @api public
 */

var stringify = exports.stringify = function(obj, prefix) {
  if (isArray(obj)) {
    return stringifyArray(obj, prefix);
  } else if ('[object Object]' == toString.call(obj)) {
    return stringifyObject(obj, prefix);
  } else if ('string' == typeof obj) {
    return stringifyString(obj, prefix);
  } else {
    return prefix;
  }
};

/**
 * Stringify the given `str`.
 *
 * @param {String} str
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyString(str, prefix) {
  if (!prefix) throw new TypeError('stringify expects an object');
  return prefix + '=' + encodeURIComponent(str);
}

/**
 * Stringify the given `arr`.
 *
 * @param {Array} arr
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyArray(arr, prefix) {
  var ret = [];
  if (!prefix) throw new TypeError('stringify expects an object');
  for (var i = 0; i < arr.length; i++) {
    ret.push(stringify(arr[i], prefix + '[]'));
  }
  return ret.join('&');
}

/**
 * Stringify the given `obj`.
 *
 * @param {Object} obj
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function stringifyObject(obj, prefix) {
  var ret = []
    , keys = objectKeys(obj)
    , key;
  for (var i = 0, len = keys.length; i < len; ++i) {
    key = keys[i];
    ret.push(stringify(obj[key], prefix
      ? prefix + '[' + encodeURIComponent(key) + ']'
      : encodeURIComponent(key)));
  }
  return ret.join('&');
}

/**
 * Set `obj`'s `key` to `val` respecting
 * the weird and wonderful syntax of a qs,
 * where "foo=bar&foo=baz" becomes an array.
 *
 * @param {Object} obj
 * @param {String} key
 * @param {String} val
 * @api private
 */

function set(obj, key, val) {
  var v = obj[key];
  if (undefined === v) {
    obj[key] = val;
  } else if (isArray(v)) {
    v.push(val);
  } else {
    obj[key] = [v, val];
  }
}

/**
 * Locate last brace in `str` within the key.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function lastBraceInKey(str) {
  var len = str.length
    , brace
    , c;
  for (var i = 0; i < len; ++i) {
    c = str[i];
    if (']' == c) brace = false;
    if ('[' == c) brace = true;
    if ('=' == c && !brace) return i;
  }
}

});

require.define("/node_modules/mkdirp/package.json",function(require,module,exports,__dirname,__filename,process,global){module.exports = {"main":"./index"}
});

require.define("/node_modules/mkdirp/index.js",function(require,module,exports,__dirname,__filename,process,global){var path = require('path');
var fs = require('fs');

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP (p, mode, f, made) {
    if (typeof mode === 'function' || mode === undefined) {
        f = mode;
        mode = 0777 & (~process.umask());
    }
    if (!made) made = null;

    var cb = f || function () {};
    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    fs.mkdir(p, mode, function (er) {
        if (!er) {
            made = made || p;
            return cb(null, made);
        }
        switch (er.code) {
            case 'ENOENT':
                mkdirP(path.dirname(p), mode, function (er, made) {
                    if (er) cb(er, made);
                    else mkdirP(p, mode, cb, made);
                });
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                fs.stat(p, function (er2, stat) {
                    // if the stat fails, then that's super weird.
                    // let the original error be the failure reason.
                    if (er2 || !stat.isDirectory()) cb(er, made)
                    else cb(null, made);
                });
                break;
        }
    });
}

mkdirP.sync = function sync (p, mode, made) {
    if (mode === undefined) {
        mode = 0777 & (~process.umask());
    }
    if (!made) made = null;

    if (typeof mode === 'string') mode = parseInt(mode, 8);
    p = path.resolve(p);

    try {
        fs.mkdirSync(p, mode);
        made = made || p;
    }
    catch (err0) {
        switch (err0.code) {
            case 'ENOENT' :
                made = sync(path.dirname(p), mode, made);
                sync(p, mode, made);
                break;

            // In the case of any other error, just see if there's a dir
            // there already.  If so, then hooray!  If not, then something
            // is borked.
            default:
                var stat;
                try {
                    stat = fs.statSync(p);
                }
                catch (err1) {
                    throw err0;
                }
                if (!stat.isDirectory()) throw err0;
                break;
        }
    }

    return made;
};

});

require.define("/lib/stylus.js",function(require,module,exports,__dirname,__filename,process,global){
/*!
 * Stylus
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Renderer = require('./renderer')
  , Parser = require('./parser')
  , nodes = require('./nodes')
  , utils = require('./utils');

/**
 * Export render as the module.
 */

exports = module.exports = render;

/**
 * Library version.
 */

exports.version = '0.31.0';

/**
 * Expose nodes.
 */

exports.nodes = nodes;

/**
 * Expose BIFs.
 */

exports.functions = require('./functions');

/**
 * Expose utils.
 */

exports.utils = require('./utils');

/**
 * Expose middleware.
 */

exports.middleware = require('./middleware');

/**
 * Expose constructors.
 */

exports.Visitor = require('./visitor');
exports.Parser = require('./parser');
exports.Evaluator = require('./visitor/evaluator');
exports.Compiler = require('./visitor/compiler');

/**
 * Convert the given `css` to `stylus` source.
 *
 * @param {String} css
 * @return {String}
 * @api public
 */

exports.convertCSS = require('./convert/css');

/**
 * Render the given `str` with `options` and callback `fn(err, css)`.
 *
 * @param {String} str
 * @param {Object|Function} options
 * @param {Function} fn
 * @api public
 */

exports.render = function(str, options, fn){
  if ('function' == typeof options) fn = options, options = {};
  new Renderer(str, options).render(fn);
};

/**
 * Return a new `Renderer` for the given `str` and `options`.
 *
 * @param {String} str
 * @param {Object} options
 * @return {Renderer}
 * @api public
 */

function render(str, options) {
  return new Renderer(str, options);
}

/**
 * Expose optional functions.
 */

exports.url = require('./functions/url');

});

return require("/lib/stylus.js");

})();
