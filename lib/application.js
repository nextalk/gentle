/**
 * Application prototype.
 */

var express = require("express")
  , path = require("path")
  , passport = require('passport')
  , flash = require('connect-flash')
  , LocalStrategy = require('passport-local').Strategy
  , mysql = require("./db/mysql.js")
  , middleware = require('./middleware.js')
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

	app.setAuth();

	app.use(app.router);

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

app.setAuth = function() {
	var options = this.get("auth")
	  , app = this;

	if( options ) {
		app.ensureAuthenticated = function(req, res, next) {
			if (req.isAuthenticated()) 
				return next();
			res.redirect('/login');
		}
		var table = options.table
		  , keyUsername = "username"
		  , keyPassword = "password"
		  , users = [];
		if( !table ) {
			users = Array.isArray( options ) ? options : [options];
		} else {
			keyUsername = options.username;
			keyPassword = options.password;
		}

		var find = function(username, fn){
			if( table ) {
				//TODO:find from table
				//app.db.table("table").findOne(keyUsername, username);
			} else {
				for (var i = 0, len = users.length; i < len; i++) {
					var user = users[i];
					if (user[keyUsername] === username) {
						return fn(null, user);
					}
				}
				return fn(null, null);
			}
		};

		passport.serializeUser(function(user, done) {
			done(null, user[keyUsername]);
		});
		passport.deserializeUser(function(username, done) {
			find(username, function (err, user) {
				done(err, user);
			});
		});
		passport.use(new LocalStrategy(function(username, password, done) {
			find(username, function(err, user){
				if (err) 
					return done(err); 
				if (!user) 
					return done(null, false, { message: 'Unknown user ' + username }); 
				if (user[keyPassword] != password)  
					return done(null, false, { message: 'Invalid password' }); 

				return done(null, user);
			});
		}));

		app.use(passport.initialize({ userProperty: 'currentUser' }));
		app.use(passport.session());
		app.use(function(req, res, next){
			res.locals.username = req.currentUser && req.currentUser[keyUsername];
			next();
		});

		//TODO: set route after middleware
		app.get('/login', function(req, res){
			res.render('login');
		});

		//app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),function(req, res) {
		//	res.redirect('/');
		//});
		app.post('/login', function(req, res, next) {
			passport.authenticate('local', function(err, user, info) {
				if (err) { return next(err) }
				if (!user) {
					res.render('login', { username: req.param("username"), message: info.message });
					return;
				}
				req.logIn(user, function(err) {
					if (err) { return next(err); }
					return res.redirect('/');
				});
			})(req, res, next);
		});
		app.get('/logout', function(req, res){
			req.logout();
			res.redirect('/');
		});
	} else {
		app.ensureAuthenticated = function() {
			return next();
		}
	}
	return this;
}

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
	app.get("/:table.:format?", middleware.table(), middleware.format, function( req, res, next ) {
		if( ! req.table ) {
			return next();
		}
		res.format({
			html: function(){
				res.render("list");
			}
		  , xls: function(){
			  res.render("index");
			}
		});
	});
}



