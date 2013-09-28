var plugin = function(){
  return function(style){
    var nodes = this.nodes;

    style.define('add', function(a, b) {
      return a.operate('+', b);
    });

    style.define('something', function() {
      return new nodes.Ident('foobar');
    });

    style.define('set_red', function(color,value) {
      return new nodes.RGBA(value.val, color.g, color.b, color.a);
    });
    
  };
};
module.exports = plugin;
