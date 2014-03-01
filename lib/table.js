/**
 * Attributes:
 *
 * 		- `name`
 * 		- `alias`
 * 		- `desc`
 * 		- `per_size`
 * 		- `primary`
 *
 */
var base = require("./base.js")
  , extend = require("./extend.js")
  , util = require("util")
  , pager = require("./pager.js")
  , column = require("./column.js");

module.exports = function(name, settings){
	if( name ) {
		this.name = name;
		this.default("alias", name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g,' '));
	}
	this.default("per_size", 15);
	this.config( settings );
};

var table = module.exports.prototype = {
	__proto__: base
  , childClass: column
};

table.attr("name", "alias", "desc", "per_size");

table.__defineGetter__("primary", function(){
	if( this._primary )
		return this._primary;
	if( this.childrenList ) {
		for (var i = 0, l = this.childrenList.length; i < l; i++) {
			var col = this.childrenList[i];
			if( col.primary ) {
				this._primary = col;
				return col;
			}
		};
	}
});

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
		fn && fn(err, self._pager);
	});
}

table.all = function(fn){
	this.db.all(this.name, {
		page: this.pager()
	}, function(err, rows){
		fn(err, rows);
	});
}

table.find = function(id, fn){
	var conditions = {};
	conditions[this.primary && this.primary.name || 'id'] = id;

	this.db.find(this.name, {
		conditions: conditions
	  , page: this.pager()
	}, function(err, row){
		fn(err, row);
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
				self.column(column.name).default(defaults);
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



