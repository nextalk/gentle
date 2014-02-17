var gentle = require('../');

describe('app', function() {
	it('should support mysql', function(){
		var app = gentle("mysql://localhost/db");
	});
});

