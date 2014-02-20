var gentle = require('../')
  , config = require('../config.js');

describe('app', function() {
	it('should support mysql', function(){
		var app = gentle();
		app.set('db url',  config.mysql + "mysql");
		app.set('secret', "wnweix32");
		app.set('auth', {username:"", password:""});
		app.config();
	});
});

