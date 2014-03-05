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
	child.table = this;
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
 * Check if has column by name
 *
 * @param {String} name
 * @return {Boolean} 
 * @api public
 *
 */
 
table.hasColumn = function( name ) {
	return !!this.children[ name ];
}


/**
 * Load data
 *
 */

table.conditions = function(page, fn){
	return this;
}

table.pager = function(page, fn){
	if( !arguments.length )
		return this._pager;
	var self = this;
	this.db.count(this.name, {}, function(err, num){
		self._pager = new pager(page, num, self.per_size);
		fn && fn(err, self._pager);
	});
	return this;
}

table.all = function(fn){
	this.db.all(this.name, {
		page: this.pager()
	}, function(err, rows){
		fn && fn(err, rows);
	});
	return this;
}

table.find = function(id, fn){
	var conditions = {};
	conditions[this.primary && this.primary.name || 'id'] = id;

	this.db.find(this.name, {
		conditions: conditions
	}, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

table.update = function(id, obj, fn){
	obj = obj || {};
	var conditions = {}
	  , key = this.primary && this.primary.name || 'id';
	conditions[key] = id;
	var data = {}
	  , columns = this.columns();

	for (var i = 0, l = columns.length; i < l; i++) {
		var col = columns[i]
		  , name = col.name;
		if( name != key && col.permit('update') && obj[name] !== undefined){
			data[name] = Array.isArray(obj[name]) ? obj[name].join(",") : obj[name];
			//Fix- Error: ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: Incorrect integer value
			if( data[name] === '' )
				data[name] = null;
		}
	};

	this.db.update(this.name, {
		conditions: conditions
	}, data, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

table.create = function(obj, fn){
	obj = obj || {};
	var key = this.primary && this.primary.name || 'id';
	var data = {}
	  , columns = this.columns();

	for (var i = 0, l = columns.length; i < l; i++) {
		var col = columns[i]
		  , name = col.name;
		if( name != key && col.permit('create') && obj[name] !== undefined){
			data[name] = Array.isArray(obj[name]) ? obj[name].join(",") : obj[name];
			if( data[name] === '' )
				data[name] = null;
		}
	};
	this.db.create(this.name, data, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

table.delete = function(id, fn){
	var conditions = {};
	conditions[this.primary && this.primary.name || 'id'] = id;
	this.db.delete(this.name, {
		conditions: conditions
	}, function(err, row){
		fn && fn(err, row);
	});
	return this;
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
				var obj = extend({}, column);
				delete obj.name;
				self.column(column.name).default(obj);
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



