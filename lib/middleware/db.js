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

db.db = function _db(req, res, next){
	var db = req.app.db;
	req.db = db.instance();
	res.locals.db = req.db;
	if(db.per)
		db.per(req.db, req, res, next);
	else
		next();
};

db.table = function _table(tableName) {
	return function(req, res, next, name){
		name = tableName || req.params.table || name;
		var db = req.db;
		if( !db.hasTable( name ) ) {
			return next();
			//return next("The table '"+table+"' has not exist!");
		}
		var table = db.table(name)
			.associate(true);
		if( table.permit("manage") ){
			req.table = table;
			res.locals.table = table;
			next();
		} else {
			next(new Error("No permission for manage `"+table.alias+"`"));
		}
	}
};

//new Error("Should load table schema at first")
db.all = function _all(req, res, next){
	if( !req.table ) {
		return next();
	}
	req.table
		.sort(req.query.sort)
		.where(req.query)
		.pager(req.query.page)
		.all(function(err, rows){
			res.locals.pager = req.table.pager();
			res.locals.params = req.table.where();
			res.locals.conditions = req.table.conditions() || {};
			req.data = res.locals.data = rows || [];
			return next(err);
		});
};

/**
 *
 * The default value for column
 *
 */
db.new = function _new(req, res, next){
	if( !req.table )

		if( !req.table.permit("create") )
			return next(new Error("No permission for create `"+req.table.alias+"`"));

	req.table.new(req.query, function(err, obj){
		res.locals.params = obj;
		next(err);
	});
}

db.create = function _create(req, res, next){
	if( !req.table )
		return next();
	if( !req.table.permit("create") )
		return next(new Error("No permission for create `"+req.table.alias+"`"));

	req.table.create(req.body, function(err, row){
		if( err ) {
			res.createError = err;
			req.table.new(req.body, function(err, obj){
				res.locals.params = obj;
				next(err);
			});
		} else {
			next();
		}
	}, true);
}

db.find =  function _find(req, res, next, id){
	if( !req.table ) {
		return next();
	}
	id = req.params.id || id;
	if(!id)
		return next(new Error("Need param :id"));
	req.table.find(id, function(err, row){
		if(!row)
			return next(err || new Error("Can't find data for '"+id+"'"));
		req.data = res.locals.data = extend(row, req.query);
		next(err);
	}, extend(req.query, req.body));
}

db.update = function _update(req, res, next){
	if( !req.table )
		return next();
	if( !req.table.permit("update") )
		return next(new Error("No permission for update `"+req.table.alias+"`"));

	res.locals.params = req.body;
	req.table.update(req.params.id, req.body, function(err, row){
		if( err ) {
			res.updateError = err;
		}
		next();
	}, 'update');
}

db.del = function _del(req, res, next){
	if( !req.table )
		return next();
	if( !req.table.permit("delete") )
		return next(new Error("No permission for delete `"+req.table.alias+"`"));

	req.table.delete(req.params.id, function(err){
		if( err ) {
			res.deleteError = err;
		}
		return next();
	});
}

db.upload = function (options){
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

	return function _upload(req, res, next){
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

db.action = function _action(req, res, next, action){
	if( !req.table ) {
		return next();
	}
	action = req.params.action || action;
	if(!action)
		return next(new Error("Need param :action"));
	if(!req.table.hasAction(action)){
		return next();
	}
	var action = req.action = req.table.action(action);
	res.locals.action = req.action;
	if(!req.data){
		//multi
		var id = req.param("id");
		if(id && id.length){
			var cond = {}
			  , key = req.table.primaryKey();
			cond[key] = id;

			var table = req.table.instance();
			if(action.display){
				table.field(key, action.display);
			}

			table.associate(false)
				.where(cond)
				.all(function(err, rows){
					if(!err && !rows.length){
						err = new Error("No data for id '"+id+"'");
					}
					req.data = res.locals.data = rows;
					if( err ){
						next(err);
					}else{
						req.table.new(extend({}, req.query, req.body), function(err, obj){
							res.locals.params = obj;
							next(err);
						});
					}
				});
		}else{
			next(new Error("Please select data at first."));
		}
	}else{
		next();
	}
}

db.runAction = function _runAction(req, res, next){
	if(!req.action)
		return next();
	res.locals.params = req.body;
	if(req.action.handler){
		req.action.handler(req, res, function(err){
			if( err )
				res.actionError = err;
			else
				res.actionSuccess = true;
			next();
		});
	}else{
		req.table.update(req.param("id"), req.body, function(err, row){
			if( err )
				res.actionError = err;
			else
				res.actionSuccess = true;
			next();
		});
	}
}

