
/**
 * Module dependencies.
 */

var css = require('css')
  , should = require('should');

module.exports = {
  'test .version': function(){
    css.version.should.match(/^\d+\.\d+\.\d+$/);
  },
  
  'test .render()': function(){
    css.render('body\n  color red', {}, function(err, css){
      should.equal(null, err);
      css.should.equal('body {\n  color: #ff0000;\n}');
    });
  },
  
  'test .render() compress option': function(){
    css.render('body\n  color red', { compress: true }, function(err, css){
      should.equal(null, err);
      css.should.equal('body{color:#ff0000;}');
    });
  },
  
  'test .render() exception': function(){
    css.render('body\n    color red', {}, function(err, css){
      err.message.should.equal('Invalid indentation, got 4 spaces and expected two');
    });
    css.render('body\n color red', {}, function(err, css){
      err.message.should.equal('Invalid indentation, got one space and expected multiple of two');
    });
  },
  
  'test .render() without options': function(){
    css.render('body\n  color red', function(err, css){
      should.equal(null, err);
      css.should.equal('body {\n  color: #ff0000;\n}');
    });
  }
};