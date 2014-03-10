/**
 * Auth by passport
 *
 */

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport = new passport.Passport();

module.exports = auth;

/**
 * Middleware for set user
 */

function auth( options ){
	var table = options.table
	  , keyUsername = "username"
	  , keyPassword = "password"
	  , users = []
	  , db;
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
			if(!db)
				return fn(new Error("Must set DB before use auth for db"), null);
			var conditions = {};
			conditions[keyUsername] = username;
			db.find(table, {
				conditions: conditions
			}, function(err, row){
				return fn(err, row);
			});
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

	var _init = passport.initialize({ userProperty: 'currentUser' })
	  , _session = passport.session();

	return function( req, res, next ) {
		//Set db
		db = req.db;
		_init(req, res, function(err){
			if(err) return next(err);
			_session(req, res, function(err){
				if(err) return next(err);
				res.locals.username = req.currentUser && req.currentUser[keyUsername];
				next();
			});
		});
	}
}

/**
 * Middleware for ensure authenticated
 */

auth.ensure = function( req, res, next ) {
	if( typeof req.isAuthenticated == "function" ){
		if (req.isAuthenticated()) 
			return next();
		res.redirect('login');
	} else {
		next();
	}
}

var router = {
	login: function(req, res){
		res.render('login');
	}
  , signup: function(req, res, next) {
	  passport.authenticate('local', function(err, user, info) {
		  if (err) { return next(err) }
		  if (!user) {
			  res.render('login', { username: req.param("username"), message: info.message });
			  return;
		  }
		  req.logIn(user, function(err) {
			  if (err) { return next(err); }
			  return res.redirect('');
		  });
	  })(req, res, next);
	}
  , logout:function(req, res){
	  req.logout();
	  res.redirect('');
	}
};

/**
 * Router for login/logout
 *
 */

auth.route = function( app ){
	app.get('/login', router.login);
	app.post('/login', router.signup);
	app.get('/logout', router.logout);
}


