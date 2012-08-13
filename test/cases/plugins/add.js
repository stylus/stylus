var plugin = function(){
  return function(style){
    style.define('add', function(a, b) {
      return a.operate('+', b);
    });
  };
};
module.exports = plugin;