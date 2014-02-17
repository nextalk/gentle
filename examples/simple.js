var gentle = require("../");

var app = gentle( "mysql://root:password@127.0.0.1/mysql" );

if ( !module.parent ) {
	app.listen(3333);
	console.log('Gentle app started on port 3333');
}
