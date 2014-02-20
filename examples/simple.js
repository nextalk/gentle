var gentle = require('../')
  , config = require('../config.js');

var app = gentle( config.mysql + "mysql" );

app.set('db url',  config.mysql + "mysql");
app.set('secret', "wnweix32");
//app.set('auth', {username:"", password:""});
app.config();

app.get("/", function(req,res){
	res.render("index");
});

if ( !module.parent ) {
	app.listen(3333);
	console.log('Gentle app started on port 3333');
}
