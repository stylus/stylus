var stylus = require('../../')
  , fs = require('fs');

describe('middleware', function() {
    var res = {};

    it('accepts functions for src and dest options', function(done){
      var req = { method: 'GET', url: 'foo/bar/all.css' };
      stylus.middleware({
        src: function(path) {
          return 'foo/bar' + path;
        },
        dest: function(path) {
          return 'baz/qux' + path;
        }
      })(req, res, done);
    });

    it('compiles a stylus file if it exists', function(done){
      var req = { method: 'GET', url: '/test.css' }
        , path;
      stylus.middleware({
        src: __dirname,
        dest: __dirname
      })(req, res, function() {
        path = __dirname + '/test.css';
        fs.readFileSync(path).toString().should.contain('color: #000');
        fs.unlinkSync(path);
        done();
      });
    });

    it('should generate a sourcemap', function(done){
      var req = { method: 'GET', url: '/test.css' }
        , path;
      stylus.middleware({
        sourcemap: { sourceRoot: '/' },
        src: __dirname,
        dest: __dirname
      })(req, res, function() {
        path = __dirname + '/test.css';
        fs.readFileSync(path).toString().should.contain('sourceMappingURL=');
        fs.unlinkSync(path);
        done();
      });
    });
});
