
var base = require("./base.js")
  , extend = require("./extend.js")
  , table = require("./table.js");

var db = module.exports = {
	__proto__: base
  , childClass: table
  , attrs: []
};

/**
 * Configure table
 *
 * @param  {String} name The name of the table
 * @param  {String|Object} settings  If a string, the name of the setting to set or retrieve. Else an associated array of setting names and values
 *
 * @return {Table}
 */

db.table = function( name, settings ){
	var child
	  , callable
	  , args = Array.prototype.slice.call(arguments, 0)
	  , len = args.length;

	if( len && typeof args[len-1] == "function" ){
		len--;
		callable = args.pop();
	}
	args.shift();
	if( typeof settings == "string" ) {
		settings = { "alias": settings };
		args.shift();
	} else {
		settings = {};
	}
	child = this.child( name, extend.apply( null, [settings].concat(args) ) );
	child.db = this;
	if( callable ) {
		callable.call( this, child );
	}
	return child;
}
/**
 * Check if has table by name
 *
 * @param {String|Table} name
 * @return {Boolean} 
 * @api public
 *
 */
 
db.hasTable = function( name ) {
	return !!this.children[ name ];
}

/**
 * Get tables
 *
 * @return {Array} tables
 */

db.tables = function(){
	return this.childrenList || [];
}

/**
 * Load schema from database and automatic configuration
 *
 * Options:
 *
 * 	- `column` enable load column from table, default true
 * 	- `comment` enable parse attribute from comment, default true
 *
 * @param {Object} options
 * @param {Function} fn
 * @return {this}
 * @api public
 */

db.load = function( options, fn ){
	var self = this;
	if( "function" == typeof options ) {
		fn = options;
		options = {};
	}
	self.loadOptions = options;
	self.loadTables( function(err, tables){
		if( !err ) {
			tables.forEach( function(table){
				self.table(table.name, table.alias ? {alias: table.alias} : {}).default(table);
			} );
		}
		fn( err, tables );
	} );
	return this;
}

db.inspect = function(){
	var tables = this.tables();
	var markup = [''];
	tables.forEach(function(t){
		markup.push( t.inspect() );
	});
	return markup.join("\n");
}

/**
 * Parse attribute for comment
 *
 * @param {String} comment
 * @return {Object}
 * @api protected
 */

db.parseComment = function( comment ) {
	var ob = {};
	if( !comment ) {
		return ob;
	}
	comment = comment.split("//");
	if( comment[1] ) {
		ob.help = comment[1].trim();
	}
	comment = comment[0].trim().split(new RegExp("\\s*\\|\\s*"));
	ob.label = comment[0];
	if( comment[1] ) {
		comment = comment[1];
		ob.type = ( comment.match( /^[\w]+/ )[0] ).toLowerCase();
		var extra = comment.match(/\(([^)]+)/);
		if( extra ) {
			extra = extra[1].trim();
			if( extra.indexOf(",") != -1 || extra.indexOf(":") != -1 ) {
				extra = extra.split(new RegExp("\\s*,\\s*")).map( function(a){
					a = a.split(new RegExp("\\s*:\\s*"));
					return a.length > 1 ? a : [a[0], a[0]];
				});
			}
			ob.extra = extra;
		}
	}
	return ob;
}

/**
 *
 */

db.loadTables = function(){
}

db.loadTable = function(){
}


