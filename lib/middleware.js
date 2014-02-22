var mime = require("express").mime;
exports.table = function() {
	return function(req, res, next){
		var table = req.params.table
		  , db = req.db;
		if( !db.hasTable( table ) ) {
			return next();
			//return next("The table '"+table+"' has not exist!");
		}
		req.table = db.table(table);
		req.table.load(function(err){
			res.locals.table = req.table;
			next(err);
		});
	}
}

exports.format = function(req, res, next) {
	var format = req.params.format;
	if( format ) {
		var accept = mime.lookup( format );
		req.headers.accept = accept;
	}
	next();
}

