
var base = require("./base.js")
  , extend = require("./extend.js")
  , util = require("util")
  , pager = require("./pager.js")
  , column = require("./column.js");

module.exports = function(name, settings){
	if( name ) {
		this.name = name;
		this.alias = name.charAt(0).toUpperCase() + name.slice(1);
	}
	this.default("per_size", 15);
	this.config( settings );
};

var table = module.exports.prototype = {
	__proto__: base
  , childClass: column
};

table.attr("name", "alias", "desc", "url", "per_size");

/**
 * Configure column
 *
 * @param  {String} name The name of the column
 * @param  {String|Object} settings  If a string, the name of the setting to set or retrieve. Else an associated array of setting names and values
 *
 * @return {Table}
 */

table.column = function( name, settings ){
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
		settings = { "label": settings };
		args.shift();
	} else {
		settings = {};
	}
	child = this.child( name, extend.apply( null, [settings].concat(args) ) );
	if( callable ) {
		callable.call( this, child );
	}
	return child;
}

/**
 * Get columns
 *
 * @return {Array} columns
 */

table.columns = function(){
	return this.childrenList || [];
}

/**
 * Load data
 *
 */

table.conditions = function(page, fn){
}

table.pager = function(page, fn){
	if( !arguments.length )
		return this._pager;
	var self = this;
	this.db.count(this.name, {}, function(err, num){
		self._pager = new pager(page, num, self.per_size);
		fn(err, self._pager);
	});
}

table.all = function(fn){
	this.db.all(this.name, {
		page: this.pager()
	}, function(err, rows){
		fn(err, rows);
	});
}

/**
 * Load columns schema for database and automatic configuration
 *
 */

table.load = function( fn ){
	var self = this;
	self.db.loadTable( this.name, function(err, columns) {
		if( !err ) {
			columns.forEach( function(column){
				var defaults = extend({}, column);
				delete defaults.name;
				delete defaults.default;
				self.column(column.name, column.label ? {label: column.label} : {}).default(defaults);
			} );
		}
		fn( err, columns );
	} );
}

table.inspect = function(){
	var columns = this.columns()
	  , markup = [];
	columns.forEach(function(t){
		t = "  table." + t.inspect().replace(/\n/g, "\n  " );
		markup.push( t );
	});
	markup = markup.length ? ", function( table ){\n"+markup.join("\n") + "\n}" : "";
	return "table( '"+this.name+"', "+util.inspect(this.settings || {}, {
		depth: null
	})+markup+" );";
}



