/**
 * Application prototype.
 */

var express = require("express")
  , path = require("path")
  , connectFlash = require('connect-flash')
  , route = require('./route')
  , auth = require('./middleware/auth')
  , db = require('./middleware/db')
  , multipart = require('./middleware/multipart')
  , brand = require('./middleware/brand')
  , url = require('./middleware/url')
  , dateFormat = require('./middleware/dateFormat')
  , format = require('./middleware/format')
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

	app.use(express.urlencoded());
	app.use(express.json());
	app.use(multipart());
	app.use(express.methodOverride());
	app.use(express.cookieParser(secret));
	app.use(express.session({key: 'gentle.sid'}));

	// i18n configure

	i18n.configure({
		locales: ['zh', 'en']
	  , cookie: 'gentle_lang'
	  , directory: path.join(path.dirname(__dirname), 'locales')
	  , defaultLocale: 'en'
	});

	app.use(i18n.init);
	var f = connectFlash();
	app.use(function flash(){f.apply(null, arguments)});

	app.use(brand);
	app.use(url);
	app.use(dateFormat);
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
	app.use(db.db);
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
	if( app.get("auth") ) {
		app.get("/.:format?", auth.ensure, route.index);
		app.param("table", auth.ensure, db.table());
	} else {
		app.get("/.:format?", route.index);
		app.param("table", db.table());
	}
	app.param("id", db.find);
	app.param("action", db.action);
	app.param("format", format);
	app.get("/:table.:format?", db.all, route.list);
	app.get("/:table/new.:format?", db.new, route.new);
	app.post("/:table/new.:format?", db.upload(), db.create, route.create);

	app.get("/:table/:action.:format?", route.action(true));
	app.post("/:table/:action.:format?", db.upload(), db.runAction, route.action(true));

	app.get("/:table/:id.:format?", route.edit);
	app.put("/:table/:id.:format?", db.upload(), db.update, route.update);
	app.del("/:table/:id.:format?", db.del, route.del);

	app.get("/:table/:id/:action.:format?", route.action());
	app.post("/:table/:id/:action.:format?", db.upload(), db.runAction, route.action());
}



