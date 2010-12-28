
/**
 * Module dependencies.
 */

var stylus = require('stylus')
  , should = require('should');

module.exports = {
  'test .version': function(){
    stylus.version.should.match(/^\d+\.\d+\.\d+$/);
  },
  
  'test .nodes': function(){
    stylus.should.have.property('nodes');
  },
  
  'test .functions': function(){
    stylus.should.have.property('functions');
  },
  
  'test .render()': function(){
    stylus.render('body\n  color red', {}, function(err, stylus){
      should.equal(null, err);
      stylus.should.equal('body {\n  color: #f00;\n}');
    });
  },
  
  'test .render() compress option': function(){
    stylus.render('body\n  color red', { compress: true }, function(err, stylus){
      should.equal(null, err);
      stylus.should.equal('body{color:#f00;}');
    });
  },
  
  'test .render() exception': function(){
    stylus.render('body\n    color red', {}, function(err, stylus){
      err.message.should.equal('stylus:2\n  1: \'body\'\n  2: \'    color red\'\n\nInvalid indentation, got 4 spaces and expected two');
    });
    stylus.render('body\n color red', { filename: 'foo.stylus' }, function(err, stylus){
      err.message.should.equal('foo.stylus:2\n  1: \'body\'\n  2: \' color red\'\n\nInvalid indentation, got one space and expected multiple of two');
    });
  },
  
  'test .render() without options': function(){
    stylus.render('body\n  color red', function(err, stylus){
      should.equal(null, err);
      stylus.should.equal('body {\n  color: #f00;\n}');
    });
  }
};