var stylus = require('../../')
	, fs = require('fs');

describe('middleware', function() {
		
	it('accepts functions for src and dest options', function(done){		
		var req = { method: 'GET', url: 'foo/bar/all.css' }
			, res = {}
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
			, res = {};
		stylus.middleware({
			src: __dirname,
			dest: __dirname
		})(req, res, function() {
			fs.readFileSync(__dirname + '/test.css').toString().should.include('color: #000')
			fs.unlinkSync(__dirname + '/test.css');
			done()
		});
	});
});