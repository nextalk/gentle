var mysql = require("../db/mysql.js")
  , extend = require("../extend.js")
  , mkdirp = require("mkdirp")
  , path = require("path")
  , gm = require("gm")
  , fs = require("fs");

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
	req.table.sort(req.query.sort).where(req.query).pager(req.query.page, function(err, pager){
		if(err)
			return next(err);
		res.locals.pager = pager;
		req.table.all(function(err, rows){
			res.locals.data = rows || [];
			next(err);
		});
	});
};

/**
 *
 * The default value for column
 *
 */
db.new = function(req, res, next){
	if( !req.table )
		return next();
	var params = res.locals.params = {};
	req.table.columns().forEach(function(col){
		params[col.name] = col.value;
	});
	extend(params, req.query);
	return next();
}

db.create = function(req, res, next){
	if( !req.table )
		return next();
	res.locals.params = req.body;
	req.table.create(req.body, function(err, row){
		if( err ) {
			res.createError = err;
			return next();
		}
		next();
	});
}

db.find =  function(req, res, next, id){
	if( !req.table ) {
		return next();
	}
	id = req.params.id || id;
	if(!id)
		return next(new Error("Need param :id"));
	req.table.find(id, function(err, row){
		if(!row)
			return next(err || new Error("Can't find data for '"+id+"'"));
		res.locals.data = row;
		next(err);
	});
}

db.update = function(req, res, next){
	if( !req.table )
		return next();
	res.locals.params = req.body;
	req.table.update(req.params.id, req.body, function(err, row){
		if( err ) {
			res.updateError = err;
		}
		next();
	});
}

db.del = function(req, res, next){
	if( !req.table )
		return next();
	req.table.delete(req.params.id, function(err){
		if( err ) {
			res.deleteError = err;
		}
		return next();
	});
}

db.upload = function(options){
	var def = __dirname + "/../../public/upload";
	if( typeof options == "string" ){
		def = options;
		options = null;
	}
	options = extend({
		image: path.resolve(def + "/images")
	  , file: path.resolve(def + "/files")
	}, options);

	mkdirp(options.image, function(err){if(err)throw err});
	mkdirp(options.file, function(err){if(err)throw err});

	return function(req, res, next){
		var table = req.table;
		Object.keys(req.files || {}).forEach(function(name){
			if( req.files[name] && table.hasColumn(name) ) {
				var col = table.column(name);
				if(col.type == "image" || col.type == "file"){
					//'image/png', 'image/jpeg', 'image/jpg', 'image/gif'
					var file = req.files[name]
					  , filename = file.filename
					  , sub = path.dirname(filename) != '.'
					  , dir = options[col.type]
					  , origin = path.join(dir, filename);
					if(sub) {
						mkdirp.sync(path.dirname(path.join(dir, filename)));
					}
					fs.writeFileSync(origin, file.data);
					req.body[name] = filename;
					if(col.type == "image" && col.extra){
						var quality = col.extra.quality
						  , box = col.extra.box;
						if( quality ) {
							//compress image
							(Array.isArray(quality) ? quality : [quality]).forEach(function(quality){
								var d = path.join(dir, ""+quality);
								mkdirp.sync(path.dirname(path.join(d, filename)));
								gm(origin).quality(quality).write(path.join(d, filename), function(err){
									//TODO: fix error
								});
							});
						}
						if( box ){
							//Thumb image
							(Array.isArray(box) ? 
								(Array.isArray(box[0]) ? box : [box]) 
								: [[box, box]]).forEach(function(box){
									var d = path.join(dir, "" + box[0] + "x" + (box[1] || box[0]));
									mkdirp.sync(path.dirname(path.join(d, filename)));
									gm(origin).thumb(box[0], box[1] || box[0], path.join(d, filename), box[2] || 100, function(err){
										//TODO: fix error

									});
								});
						}
					}
				}
			}
		});
		next();
	}
}
