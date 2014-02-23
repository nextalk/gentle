var mime = require("express").mime;

mime.define({
	"text/plain": ["ajax"]
});

exports.path = function(req, res, next) {
	var path = req.app.path();
	res.locals.urlFor = function( url ){
		return path == "/" ? url : ( path + url );
	}
	next();
}

exports.table = function() {
	return function(req, res, next, name){
		name = req.params.name || name;
		var db = req.db;
		if( !db.hasTable( name ) ) {
			return next();
			//return next("The table '"+table+"' has not exist!");
		}
		req.table = db.table(name);
		req.table.load(function(err){
			res.locals.table = req.table;
			next(err);
		});
	}
}

exports.format = function(req, res, next, format) {
	format = req.params.format || format;
	if( format ) {
		var accept = mime.lookup( format );
		req.headers.accept = accept;
	}
	next();
}

