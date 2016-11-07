var plugin = function(options){
  return function(style){
    var nodes = this.nodes;

    style.define('add', function(a, b) {
      return a.operate('+', b);
    });

    style.define('something', function() {
      return new nodes.Ident('foobar');
    });

    style.define('set_red', function(color, value) {
      return new nodes.RGBA(value.val, color.g, color.b, color.a);
    });

    style.define('get_opt', function(name) {
      var val = options[name.val];
      switch (typeof val) {
        case 'boolean':
          return new nodes.Boolean(val);
        case 'number':
          return new nodes.Unit(val);
        case 'string':
        default:
          return new nodes.String(val);
      }
    });
  };
};
module.exports = plugin;
