var mysql = require("../db/mysql.js");
module.exports = db;

function db( options ){
	if( !options ) 
		throw new Error('`db url` required for database setting'); 

	var type = typeof options == "string" ? options.split(":")[0] : ( options.type || "mysql" )
	  , db;
	if( "mysql" == type ) {
		db = new mysql(options);
	} else {
		throw new Error( "Unsupport database type: " + type );
	}
	return db;
}

db.loadDB = function(req, res, next){
	req.db = req.app.db;
	req.db.load(function(err){
		res.locals.tables = req.db.tables();
		next(err);
	});
};

db.loadTable = function(tableName) {
	return function(req, res, next, name){
		name = tableName || req.params.table || name;
		var db = req.db;
		if( !db.hasTable( name ) ) {
			return next();
			//return next("The table '"+table+"' has not exist!");
		}
		req.table = db.table(name).clone();
		req.table.load(function(err){
			res.locals.table = req.table;
			next(err);
		});
	}
};

//new Error("Should load table schema at first")
db.all = function(req, res, next){
	if( !req.table ) {
		return next();
	}
	req.table.all(function(err, rows){
		res.locals.data = rows || [];
		next(err);
	});
};

