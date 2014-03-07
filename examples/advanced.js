var gentle = require('../')
  , express = require('express')
  , config = require('./config.js');

var app = gentle();

app.set('db url',  config.mysql + "gentle_test");
app.set('secret', "mysecret-123");
app.set('auth', {table: "admin", username:"login", password:"password"});

app.config();

app.db.load(function(err, db){
	if(err)
		throw err;

	var city = db.table("cities")
		.permit("create", false)
		.permit("delete", false)

	var user = db.table("users")
		.permit("create", false)
		.permit("update", false)
		.permit("delete", false)

	var post = db.table("posts", function(table){
		table.column("id");
		table.column("pic", {
			type: "image"
		  , extra:{
			  quality: [30, 60]
			, box: [[50, 50], [200, 150]]
			}
		});
		table.column("title", {
			value: "Title"
		});
		table.column("city_id")
			.filter(city, "name")
			.belong(city, "name");
		table.column("user_id")
			.filter(user, "name", "city_id")
			.belong(user, "name");

	}).search("title", "relation", "Search title and relation");

	user.column("post_num").has(post, "user_id");
	city.column("post_num").has(post, "city_id");
	//The key is city_id
	city.column("user_num").has(user);

});

app.get("/", function(req,res){
	res.render("index");
});

var myapp = express();

myapp.use( '/admin', app );

if ( !module.parent ) {
	myapp.listen(3333);
	console.log('Gentle app started on port 3333');
}


