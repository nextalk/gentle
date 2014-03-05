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

table.conditions = function(obj){
	if(!arguments.length)
		return this._conditions;
	this._conditions = extend({}, this._conditions, obj);
	return this;
}

table.where = function(obj){
	if(!arguments.length)
		return this._where;
	obj = extend({}, this._where, obj);
	//Clean page and sort
	delete obj.page;
	delete obj.sort;
	for(var key in obj){
		if(!this.hasColumn(key)){
			delete obj[key];
		}
	}
	this._where = obj;
	return this;
}

table.sort = function(name){
	if(!arguments.length)
		return this._sort || {name: this._primaryKey()};
	if(name) {
		var asc = name.charAt(0) === "-"
		  , name = asc ? name.slice(1) : name;
		if(this.hasColumn(name)){
			this._sort = {name: name, asc: asc};
		}
	}
	return this;
}

/**
 * @api private
 */
table._cond = function(page, sort){
	var cond = extend({}, this.where(), this.conditions());
	return {
		conditions: cond
	  , page: page
	  , sort: this.sort()
	};
}

table._primaryKey = function(){
	return this.primary && this.primary.name || "id";
}

table.pager = function(page, fn){
	if( !arguments.length )
		return this._pager;
	var self = this;
	this.db.count(this.name, this._cond(), function(err, num){
		self._pager = new pager(page, num, self.per_size);
		fn && fn(err, self._pager);
	});
	return this;
}

table.all = function(fn){
	this.db.all(this.name, this._cond(this.pager()), function(err, rows){
		fn && fn(err, rows);
	});
	return this;
}

table.find = function(id, fn){
	var op = this._cond();
	op.conditions[this._primaryKey()] = id;
	this.db.find(this.name, op, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

table.update = function(id, obj, fn){
	obj = obj || {};
	var op = this._cond()
	  , key = this._primaryKey();
	op.conditions[key] = id;

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

	this.db.update(this.name, cond, data, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

table.create = function(obj, fn){
	obj = obj || {};
	var key = this._primaryKey();

	var data = {}
	  , conditions = extend({}, this.conditions())
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
	var op = this._cond();
	op.conditions[this._primaryKey()] = id;
	this.db.delete(this.name, op, function(err, row){
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



