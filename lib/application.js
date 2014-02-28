/**
 * Application prototype.
 */

var express = require("express")
  , path = require("path")
  , flash = require('connect-flash')
  , route = require('./route.js')
  , auth = require('./middleware/auth.js')
  , db = require('./middleware/db.js')
  , init = require('./middleware/init.js')
  , format = require('./middleware/format.js')
  , i18n = require('i18n')
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

	app.set('view engine', 'jade');
	app.set('views', path.join( dir, 'views' ));

	//Logger before static file when production mode
	app.configure('development', function(){
		app.use(express.logger('dev'));
	});

	app.use(express.favicon(path.join(dir, 'public/favicon.ico')));
	app.use(express.static(path.join( dir, 'public')));

	//Logger After static file when production mode
	app.configure('production', function(){
		app.use(express.logger());
	});

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser(secret));
	app.use(express.session());
	app.use(express.methodOverride());

	// i18n configure

	i18n.configure({
		locales: ['zh', 'en']
	  , cookie: 'gentle_lang'
	  , directory: __dirname + '/locales'
	  , defaultLocale: 'en'
	});

	app.use(i18n.init);
	app.use(flash());

	app.use(init);
	app.setDB(app.get('db url'));

	var _auth = app.get("auth");
	if( _auth )
		app.use( auth(_auth) );

	app.use(app.router);

	if( _auth )
		auth.route( app );

	app.configure('development', function(){
		app.use(express.errorHandler());
	});

	app.configRoute();
}

/**
 * Set database
 *
 * @return {Function}
 * @api private
 */

app.setDB = function( options ) {
	var app = this;
	app.db = db(options);
	app.use(db.loadDB);
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
	//app.get("/:table/:id/:action.:format?", db.loadTable());
	app.param("table", db.loadTable());
	app.param("format", format);
	app.get("/:table.:format?", db.all, route.list);
}



