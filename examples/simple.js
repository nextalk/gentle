var gentle = require('../')
  , config = require('../config.js');

var app = gentle( config.mysql + "mysql" );

if ( !module.parent ) {
	app.listen(3333);
	console.log('Gentle app started on port 3333');
}
