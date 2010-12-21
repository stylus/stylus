
/**
 * Module dependencies.
 */

var css = require('css')
  , should = require('should')
  , fs = require('fs');

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

// TODO: move to integration

(function test(fixture) {
  var base = __dirname + '/fixtures/' + fixture
    , path =  base + '.in'
    , csspath = base + '.css';
  fs.readFile(path, 'utf8', function(err, str){
    if (err) throw err;
    css.render(str, { filename: path }, function(err, actual){
      if (err) throw err;
      fs.readFile(csspath, 'utf8', function(err, expected){
        if (err) throw err;
        actual.should.equal(expected);
      });
    });
  });
  return test;
})
('variable');