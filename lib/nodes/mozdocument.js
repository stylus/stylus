var Node = require('./node')
  , nodes = require('./');

var MozDocument = module.exports = function MozDocument(val){
  Node.call(this);
  this.val = val;
};

MozDocument.prototype.__proto__ = Node.prototype;

MozDocument.prototype.clone = function(parent){
  var clone = new MozDocument(this.val);
  clone.block = this.block.clone(parent, clone);
  clone.lineno = this.lineno;
  clone.filename = this.filename;
  return clone;
};

MozDocument.prototype.toJSON = function(){
  this.__type = 'MozDocument';
  return this;
};

MozDocument.prototype.toString = function(){
  return '@-moz-document ' + this.val;
}
