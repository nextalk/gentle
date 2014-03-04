var gentle = require('../')
  , config = require('./config.js');

var app = gentle();

app.set('db url',  config.mysql + "mysql");
app.set('secret', "mysecret-123");
app.set('auth', {username:"demo", password:"demo"});

app.config();

app.get("/", function(req,res){
	res.render("index");
});

app.get("/my", app.ensureAuthenticated, function(req,res){
	res.render("index");
});

if ( !module.parent ) {
	app.listen(3333);
	console.log('Gentle app started on port 3333');
}
