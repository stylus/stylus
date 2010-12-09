
/**
 * Module dependencies.
 */

var css = require('css')
  , should = require('should');

module.exports = {
  'test .version': function(){
    css.version.should.match(/^\d+\.\d+\.\d+$/);
  }
};