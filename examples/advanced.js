var gentle = require('../')
  , express = require('express')
  , config = require('../config.js');

var app = gentle();

app.set('db url',  config.mysql + "gentle_test");
app.set('secret', "mysecret-123");
app.set('auth', {username:"demo", password:"demo"});

app.config();

var db = app.db;

app.get("/", function(req,res){
	res.render("index");
});

var myapp = express();

myapp.use( '/admin', app );

if ( !module.parent ) {
	myapp.listen(3333);
	console.log('Gentle app started on port 3333');
}


