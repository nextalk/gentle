var base = require("../db.js")
  , extend = require("../extend.js")
  , mysql = require("mysql");

//TODO: Not callback sometimes

exports = module.exports = function(options){
	var self = this;
	//Use pool
	this.conn = mysql.createPool( options );
	return;
	function handleDisconnect() {
		self.conn = mysql.createConnection( options ); // Recreate the connection, since
		// the old one cannot be reused.
		self.conn.connect(function(err) {              // The server is either down
			if(err) {                                     // or restarting (takes a while sometimes).
				console.warn(new Date(), "mysql onConnect", err);
				setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
			}                                     // to avoid a hot loop, and to allow our node script to
		});                                     // process asynchronous requests in the meantime.
		// If you're also serving http, display a 503 error.
		self.conn.on('error', function(err) {
			if(err)
				console.warn(new Date(), "mysql onError", err);
			if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
				handleDisconnect();                         // lost due to either server restart, or a
			} else {                                      // connnection idle timeout (the wait_timeout
				//throw err;                                  // server variable configures this)
				setTimeout(handleDisconnect, 2000);
			}
		});
	}
	handleDisconnect();
}

var db = module.exports.prototype = {
	__proto__: base
};

db.destroy = function(){
	//this.conn.end( function(err) {} );
	this.conn.end();
}

db.query = function(){
	this.conn.query.apply( this.conn, arguments );
}

/*
 *
 * Options
 *
 * 	- `conditions`
 * 	- `sort`
 * 	- `group`
 * 	- `page`	{per_size: 10, page: 2}
 */

db.optionsToSql = function( options, skipSortAndPage ){
	options = options || {};
	var res = {}
	  , conditions = options.conditions
	  , group = options.group
	  , sort = options.sort
	  , page = options.page
	  , fields = options.fields;
	//conditions/where
	var where = [];
	if(conditions) {
		//TODO: is object, empty
		for( var k in conditions ) {
			var val = conditions[k]
			  , sep = " = ";
			if( typeof val === "string" || typeof val === "number") {
				val = mysql.escape(val);
			} else if( Array.isArray(val) ) {
				sep = " IN ";
				val = mysql.escape([val]);
			} else if( val === null ) {
				sep = " IS ";
				val = "NULL";
			} else if( val && typeof val === "object" ) {
				if( val.type == "search" ) {
					var _val = mysql.escape("%" + val.value + "%")
					  , _sql = [];
					for (var i = 0, l = val.key.length; i < l; i++) {
						var n = val.key[i];
						_sql.push( mysql.escapeId(n) + " LIKE " + _val );
					};
					sep = k = "";
					val = _sql.join(" OR ");
				} else if( val.type == "between" ) {
					sep = " ";
					val = "BETWEEN "+mysql.escape(val.value[0])+" AND " + mysql.escape(val.value[1]);
				} else {
					continue;
				}
			} else {
				continue;
			}
			where.push("(" + (k && mysql.escapeId(k)) + sep + val  + ")");
		}
		if( where.length )
			res.conditions = "WHERE " + where.join(' AND ');
	}

	//Sort
	if( sort ) {
		var name
		  , asc = false;
		if( sort && typeof sort === "string" ) {
			asc = sort.charAt(0) === "-";
			if( asc )
				name = sort.slice(1);
			else
				name = sort;
		} else if( typeof sort === "object") {
			name = sort.name;
			asc = sort.asc;
		}
		if( name ) {
			res.sort = "ORDER BY "+mysql.escapeId(name)+" " + (asc ? "ASC" : "DESC");
		}
	}

	//Group
	if( group ) {
		if( typeof group === "string" ) {
			res.group = "GROUP BY " + mysql.escapeId(group);
		}
	}

	//page
	if(page && parseInt(page.per_size)) {
		var per_size = parseInt(page.per_size);
		page = parseInt(page.page) || 1;
		res.page = "LIMIT "+per_size+" OFFSET " + (per_size*(page - 1));
	} else {
		res.page = "LIMIT 300 OFFSET 0";
	}
	//Fields
	if(fields && fields.length){
		res.fields = fields.map(function(f){ return mysql.escapeId(f) }).join(',');
	}
	var sql = [];
	if( res.conditions ){
		sql.push(res.conditions);
	}
	if( res.group ){
		sql.push(res.group);
	}
	if( !skipSortAndPage && res.sort ){
		sql.push(res.sort);
	}
	if( !skipSortAndPage && res.page ){
		sql.push(res.page);
	}
	res.sql = sql.join(" ");
	return res;
}

db.all		= function(tableName, options, fn){
	options = this.optionsToSql(options);
	return this.query("SELECT "+(options.fields || "*")+" FROM ?? " + options.sql, [tableName], fn);
}

/**
 * Support count by the first field
 */

db.count	= function(tableName, options, fn){
	var count = "count(*) num"
	  , field = null;
	if(options && options.fields && options.fields.length){
		field = options.fields[0];
	}
	options = this.optionsToSql(options, true);
	if(field){
		count = options.fields + ", count("+mysql.escapeId(field)+")";
	}
	return this.query("SELECT "+count+" FROM ?? " + options.sql, [tableName], function(err, rows){
		if(!err && !field)
			rows = rows[0] && rows[0].num || 0;
		fn && fn(err, rows);
	});
}

db.find		= function(tableName, options, fn){
	options = extend(options, {page: {per_size: 1}});
	options = this.optionsToSql(options);
	return this.query("SELECT "+(options.fields || "*")+" FROM ?? " + options.sql, [tableName], function(err, rows){
		fn && fn(err, err ? rows : rows[0]);
	});
}

db.create	= function(tableName, obj, fn){
	return this.query("INSERT INTO ?? SET ?", [tableName, obj], fn);
}

db.update	= function(tableName, options, obj, fn){
	options = this.optionsToSql(options, true);
	return this.query("UPDATE ?? SET ? " + options.sql, [tableName, obj], fn);
}

db.delete	= function(tableName, options, fn){
	options = this.optionsToSql(options, true);
	return this.query("DELETE FROM ?? " + options.sql, [tableName], fn);
}

db.loadTables = function( fn ){
	var self = this
	  , options = self.loadOptions
	  , enComment = options && options.hasOwnProperty("comment") ?
		options.comment : true;

	this.query( 'SHOW TABLE STATUS', function( err, rows ) {
		if( !err ) {
			rows = rows.map(function( row ) {
				var obj = {
					name: row["Name"]
				};
				if( enComment ) {
					var comment = base.parseComment( row["Comment"] );
					if( comment.disabled )
						obj.disabled = true;
					if( comment.label )
						obj.alias = comment.label;
					if( comment.help )
						obj.desc = comment.help;
				}
				return obj;
			}).filter(function(row){
				return !row.disabled;
			});
		}
		fn && fn.call( self, err, rows );
	} );
}

db.loadTable = function( name, fn ){
	var self = this
	  , options = self.loadOptions
	  , enComment = options && options.hasOwnProperty("comment") ?
		options.comment : true;
	this.query( 'SHOW FULL COLUMNS FROM ??', name, function( err, rows ) {
		if( !err ) {
			rows = rows.map( function( row ) {
				var obj = { 
					name: row["Field"]
				  , primary: row["Key"] == "PRI"
				};
				if( row["Default"] !== null ) {
					obj.value = row["Default"];
				}
				var type = parseType( row["Type"] );
				extend( obj, type );
				if( enComment ) {
					var comment = base.parseComment( row["Comment"] );
					extend( obj, comment );
					if( comment.type ) {
						obj.extra = comment.extra;
					}
				}
				return obj;
			} ).filter(function(row){
				return !row.disabled;
			});
		}
		fn && fn.call( self, err, rows );
	} );
}

/**
 * Parse the table type
 *
 * 	TODO datetime
 *
 * 	- `type` [number, text, textarea, bool, select, checkgroup, date]
 *
 * Return object:
 *
 * 	- `oriType`
 * 	- `type`
 * 	- `extra`
 *
 *
 * @param {String} type
 * @return {Object}
 *
 * @api private
 *
 */

var types = {
	"bit": "number",
	"int": "number",
	"tinyint": "number",
	"smallint": "number",
	"mediumint": "number",
	"bigint": "number",
	"decimal": "number",
	"float": "number",
	"double": "number",
	"char": "text",
	"varchar": "text",
	"binary": "text",
	"varbinary": "text",
	"text": "textarea",
	"tinytext": "textarea",
	"mediumtext": "textarea",
	"longtext": "textarea",
	"blob": "textarea",
	"tinyblob": "textarea",
	"mediumblob": "textarea",
	"longblob": "textarea",
	"enum": "select",
	"set": "checkgroup",
	"date": "date",
	"datetime": "datetime",
	"timestamp": "datetime",
	"time": "time",
	"year": "text",
};

var parseType = exports.parseType = function( str ){
	var oriType = ( str.match( /^[\w]+/ )[0] ).toLowerCase()
	  , extra = str.match(/\(([^)]+)/);
	if( extra ) {
		extra = extra[1];
		var quote = extra.charAt(0);
		if( quote == "'" || quote == '"' ) {
			extra = extra.replace(new RegExp("^"+quote+"|"+quote+"$", "g"), "").split( new RegExp(quote + "\\s*,\\s*" + quote) );
		} else {
			extra = extra.split(/\s*[,]\s*/);
		}
	}
	var type = types[ oriType ] || "text"
	  , range = false;
	if( "tinyint" == oriType && extra && 1 == extra[0] ) {
		type = 'bool';
	}
	if( "date" == type ) {
		range = true;
	} else if( "number" == type ) {
		extra = extra && extra[0] ? (extra && extra[1] ? Math.pow(0.1, extra[1]) : 1) : "any";
	} else if( "select" == type || "checkgroup" == type ) {
		extra = extra && extra.map( function(a) { return [a, a]; } );
	}

	return {
		oriType: oriType
	  , type: type
	  , extra: extra
	};
}


function firstColumn( rows ) {
	return rows.map( function( row ) {
		return row[Object.keys(row)[0]];
	} );
}



