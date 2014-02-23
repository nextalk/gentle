/**
 * Application prototype.
 */

var express = require("express")
  , path = require("path")
  , flash = require('connect-flash')
  , mysql = require("./db/mysql.js")
  , middleware = require('./middleware.js')
  , route = require('./route.js')
  , auth = require('./auth.js')
  , app = exports = module.exports = {};

/**
 * Config the server.
 *
 * Options
 * 	
 * 	- `path` The public and views dir path
 * 	- `secret` The cookie and session secret
 * 	- `db url` The database url options
 * 	- `auth` The auth options, support find user from table
 *
 * 	Example:
 *
 * 	app.set('auth', {username: "root", password: "123456"});
 * 	app.set('auth', [{username: "root", password: "123456"}, {username: "jake", password: "123456"}]);
 * 	app.set('auth', {table: "admin", username: "login", password: "password"});
 *
 * @api public
 *
 */

app.config = function( options ) {
	var app = this;
	if( typeof options == "object" ) {
		for( var key in options ) {
			app.set(key, options[key]);
		}
	}
	var dir = app.get("path") || path.dirname( __dirname )
	  , secret = app.get("secret");

	if( !secret )
		throw new Error('app.set("secret", secret) required for the cookie and session'); 

	app.setDB();

	app.set('view engine', 'jade');

	app.configure('development', function(){
		app.use(express.logger('dev'));
	});
	app.configure('production', function(){
		app.use(express.logger());
	});

	app.use(express.favicon(path.join(dir, 'public/favicon.ico')));
	app.use(express.static( path.join( dir, 'public' )));

	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(express.cookieParser(secret));
	app.use(express.session());
	app.use(flash());

	app.use(middleware.path);
	app.set('views', path.join( dir, 'views' ));

	var _auth = app.get("auth");
	if( _auth )
		app.use( auth(_auth) );

	app.use(app.router);

	if( _auth )
		auth.route( app );

	app.configure('development', function(){
		app.use(express.errorHandler());
	});

	app.locals.brand_name = "Gentle";

	app.configRoute();
}

/**
 * Auth by passport
 *
 * @return {this}
 * @api private
 */

/**
 * Set database
 *
 * @return {Function}
 * @api private
 */

app.setDB = function( options ) {
	var app = this
	  , options = app.get("db url");

	if( !options )
		throw new Error('app.set("db url", dburl) required'); 

	var type = typeof options == "string" ?
		options.split(":")[0] : ( options.type || "mysql" );
	if( "mysql" == type ) {
		app.db = new mysql(options);
	} else {
		throw new Error( "Unsupport database type: " + type );
	}
	app.use(function(req, res, next){
		req.db = app.db;
		app.db.load(function(err){
			res.locals.tables = req.db.tables();
			next(err);
		});
	});
	return this;
}

/**
 * Router
 *
 * index
 * create, save
 * edit, update
 * delete
 * action
 * multiAction
 *
 * this.get("/:table", function(){});
 *
 * this.get("/:table/new", function(){});
 * this.post("/:table/new", function(){});
 *
 * this.get("/:table/:id", function(){});
 * this.put("/:table/:id", function(){});
 * this.del("/:table/:id", function(){});
 *
 * this.get("/:table/:id/:action", function(){});
 * this.post("/:table/:id/:action", function(){});
 */

app.configRoute = function() {
	var app = this;
	//app.get("/:table/:id/:action.:format?", middleware.table());
	app.param("table", middleware.table());
	app.param("format", middleware.format);
	app.get("/:table.:format?", route.list);
}



