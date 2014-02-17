var gentle = require('../')
  , config = require('../config.js');

describe('app', function() {
	it('should support mysql', function(){
		var app = gentle( config.mysql + "mysql" );
	});
});

