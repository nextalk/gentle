/**
 * Application prototype.
 */

var express = require("express")
  , path = require("path")
  , passport = require('passport')
  , flash = require('connect-flash')
  , LocalStrategy = require('passport-local').Strategy
  , mysql = require("./db/mysql.js")
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
	var dir = app.set("path") || path.dirname( __dirname )
	  , secret = app.set("secret");

	if( !secret )
		throw new Error('app.set("secret", secret) required for the cookie and session'); 

	app.setDB();

	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());

	app.use(express.cookieParser(secret));
	app.use(express.session());
	app.use(flash());

	app.setAuth();

	app.set('views', path.join( dir, '/views' ));
	app.use(express.static( path.join( dir, '/public' )));
	app.use(app.router);

	app.configure('development', function(){
		app.use(express.logger('dev'));
		app.use(express.errorHandler());
	});
	app.configure('production', function(){
		app.use(express.logger());
	});
}

/**
 * Auth by passport
 *
 * @return {this}
 * @api private
 */

app.setAuth = function() {
	var options = this.set("auth")
	  , app = this;

	if( options ) {
		app.ensureAuthenticated = function() {
			if (req.isAuthenticated()) 
				return next();
			res.redirect('/login')
		}
		var table = options.table
		  , key = "username"
		  , passKey = "password"
		  , users = [];
		if( !table ) {
			users = Array.isArray( options ) ? options : [options];
		} else {
			key = options.username;
			passKey = options.password;
		}

		var find = function(username, callback){
			if( table ) {
				//TODO:find from table
				//app.db.table("table").findOne(key, username);
			} else {
				for (var i = 0, len = users.length; i < len; i++) {
					var user = users[i];
					if (user.username === username) {
						return fn(null, user);
					}
				}
				return fn(null, null);
			}
		};

		passport.serializeUser(function(user, done) {
			done(null, user[key]);
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
				if (user[passKey] != password)  
					return done(null, false, { message: 'Invalid password' }); 

				return done(null, user);
			});
		}));


		app.use(passport.initialize());
		app.use(passport.session());

		app.get('/login', function(req, res){
			res.render('login', { user: req.user, message: req.flash('error') });
		});
		app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
		function(req, res) {
			res.redirect('/');
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
	var options = this.set("db url");
	if( !options )
		throw new Error('app.set("db url", dburl) required'); 

	var type = typeof options == "string" ?
		options.split(":")[0] : ( options.type || "mysql" );
	return this;
}


