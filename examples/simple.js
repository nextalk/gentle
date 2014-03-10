var gentle = require('../')
  , config = require('./config.js');

var app = gentle();

app.set('db url',  config.mysql + "mysql");
app.set('secret', "mysecret-123");
app.set('auth', {username:"demo", password:"demo"});

app.config();
app.db.load();

if ( !module.parent ) {
	app.listen(3333);
	console.log('Gentle app started on port 3333');
}
