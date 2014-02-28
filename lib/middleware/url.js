var url = require("url")
  , table = require("../table.js")
  , extend = require("../extend.js");

/**
 * merge the url
 *
 * 		url('/post')	//=> /post
 * 		url(table)	//=> /post
 * 		url(table, 'new')	//=> /post/new
 * 		url(table, {conditions:{name:"demo"}})	//=> /post/new?name=demo
 *
 */

function urlFor(t, obj, options){
	if( !arguments.length ){
		return '';
	}
	var path = ''
	  , args = Array.prototype.slice.call(arguments, 1)
	  , isTable;
	if( typeof t === "string" ) {
		path += t;
	} else if( t instanceof table ) {
		isTable = true;
		path += '/' + t.name;
		if( t.primary && obj && obj[t.primary.name] ) {
			path += '/' + obj[t.primary.name];
			args.shift();
		}
	}
	var op, query = {};
	while(op = args.shift()){
		if( typeof op == "string" ){
			path+="/"+op;
		} else if( typeof op == "object" ) {
			extend(query, op.conditions);
			if( op.page )
				query.page = op.page;
		}
	}
	path += url.format({query: query});
	return path;
}

exports = module.exports = function(req, res, next){
	var path = req.app.path();
	res.locals.url = function(uri){
		uri = urlFor.apply(null, arguments);
		return path == "/" ? uri : ( path + uri );
	}
	next();
}

exports.urlFor = urlFor;
