
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
	if( !child.config("db") ) {
		child.config("db", this);
	}
	if( callable ) {
		callable.call( this, child );
	}
	return child;
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
 * @param {Array} data
 * @return {db}
 * @api public
 */

db.load = function( data ){
	return this;
}

