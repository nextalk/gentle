var base = require("../db.js")
  , extend = require("../extend.js")
  , mysql = require("mysql");

exports = module.exports = function(options){
	var self = this;
	function handleDisconnect() {
		self.conn = mysql.createConnection( options ); // Recreate the connection, since
		// the old one cannot be reused.
		self.conn.connect(function(err) {              // The server is either down
			if(err) {                                     // or restarting (takes a while sometimes).
				setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
			}                                     // to avoid a hot loop, and to allow our node script to
		});                                     // process asynchronous requests in the meantime.
		// If you're also serving http, display a 503 error.
		self.conn.on('error', function(err) {
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
	this.conn.destroy();
}

db.query = function(){
	this.conn.query.apply( this.conn, arguments );
}

db.loadTables = function( unComment, fn ){
	var self = this;
	if( typeof unComment == "function" ) {
		fn = unComment;
		unComment = false;
	}
	this.query( 'SHOW TABLE STATUS', function( err, rows ) {
		if( !err ) {
			rows = rows.map( function( row ) {
				var obj = {
					name: row["Name"]
				};
				if( !unComment ) {
					var comment = base.parseComment( row["Comment"] );
					if( comment.label )
						obj.alias = comment.label;
					if( comment.help )
						obj.desc = comment.help;
				}
				return obj;
			} );
		}
		fn && fn.call( self, err, rows );
	} );
}

db.loadTable = function( name, unComment, fn ){
	var self = this;
	if( typeof unComment == "function" ) {
		fn = unComment;
		unComment = false;
	}
	this.query( 'show full columns from ??', name, function( err, rows ) {
		if( !err ) {
			rows = rows.map( function( row ) {
				var obj = { 
					name: row["Field"]
				  , key: row["Key"] == "PRI"
				  , default: row["Default"]
				};
				var type = parseType( row["Type"] );
				extend( obj, type );
				if( !unComment ) {
					var comment = base.parseComment( row["Comment"] );
					extend( obj, comment );
					if( comment.type ) {
						obj.extra = comment.extra;
					}
				}
				return obj;
			} );
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
	"datetime": "text",
	"timestamp": "text",
	"time": "text",
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



