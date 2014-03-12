var gentle = require('../')
  , express = require('express')
  , config = require('./config.js');

var app = gentle();

app.set('db url',  config.mysql + "gentle_test");
app.set('secret', "mysecret-123");
//app.set('auth', {table: "admin", username:"login", password:"password"});

app.config();

app.db.load(function(err, db){
	if(err)
		throw err;

	var city = db.table("cities")
		.permit("create", false)
		.permit("delete", false)

	var admin = db.table("admin", function(table){
		table.permit("create", "!created_at")
			.permit("update", "!created_at")
			.permit("display", "!created_at")

		table.column("role", {
			type: "select"
		  , extra: [
				[0, "Admin"]
			  , [1, "Editor"]
			  , [2, "Visitor"]
			]
		});

		table.column("city_id", "Permission City").belong(city, "name");
	});

	var user = db.table("users")
		.permit("create", false)
		.permit("update", false)
		.permit("delete", false)
	user.column("city_id")
		.filter(city, "name")
		.belong(city, "name");

	var post = db.table("posts", function(table){
		table.search("title", "relation", "Search title and relation")
			.permit("display", "!content,!price")
			.permit("create", "!publish,!post_to,!post_date,!post_time,!retry")
			.permit("update", "!publish,!post_to,!post_date,!post_time,!retry");

		table.column("id");
		table.column("publish", "Pub");
		table.column("pic", {
			type: "image"
		  , extra:{
			  quality: [30, 60]
			, box: [[50, 50], [200, 150]]
			, rename: "byDate"
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

		table.action("publish", "Pub", {
			display: "title"
		  , columnNames: "publish"
		  , submit: "Save"
		});

		table.action("post", "Post", {
			display: "title"
		  , columnNames: "post_to,post_date,post_time,retry"
		  , submit: "Save"
		}, function(req, res, done){
			req.table.update(req.param("id"), req.body, function(err){
				done(err);
			});
		});

		table.multiAction("publish", "Pub", {
			display: "title"
		  , columnNames: "publish"
		  , submit: "Save"
		});

		table.multiAction("post", "Post", {
			display: "title"
		  , columnNames: "post_to,post_date,post_time,retry"
		  , submit: "Save"
		}, function(req, res, done){
			req.table.update(req.param("id"), req.body, function(err){
				done(err);
			});
		});
	});

	user.column("post_num").has(post, "user_id");
	city.column("post_num").has(post, "city_id");
	//The key is city_id
	city.column("user_num").has(user);

});


//Custom set db schema for per request
app.db.per = function(db, req, res, next){
	var currentUser = req.currentUser || {
//		role: 1
//	  , city_id: 1
	};
	if(currentUser.role == 1){
		//Editor
		db.permit("manage", "!admin");
		db.table("cities").permit("update", 0);
	}else if(currentUser.role == 2){
		//Visitor
		db.permit("manage", "!admin");
		db.permit("update", "!cities,!posts");
		db.table("posts").permit("create", 0);
	}
	if(currentUser.city_id) {
		db.permit("manage", "!cities");
		var cond = { 
			city_id: currentUser.city_id 
		};
		db.table("users").conditions(cond);
		db.table("posts").conditions(cond);
	}
	next();
}

var myapp = express();

myapp.use( '/admin', app );

if ( !module.parent ) {
	myapp.listen(3333);
	console.log('Gentle app started on port 3333');
}


