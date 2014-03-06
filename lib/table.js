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
  , async = require("async")
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

table.primaryKey = function(){
	return this.primary && this.primary.name || "id";
}

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
	return !!(this.children && this.children[ name ]);
}

/**
 * Config the search UI
 */
table.search = function(){
	if(!arguments.length)
		return this._search;
	this._search = {
		title: arguments[arguments.length-1]
	  , fields:Array.prototype.slice.call(arguments,0, -1)
	};
	return this;
}

/**
 * Define the default conditions for permit
 */
table.conditions = function(obj){
	if(!arguments.length)
		return this._conditions;
	this._conditions = extend({}, this._conditions, obj);
	return this;
}

/**
 * Get the filters option
 * type-> select,date
 * permit("filter")
 *
table.filters = function(){
	var columns = this.columns()
	  , filters = [];
	for (var i = 0, l = columns.length; i < l; i++) {
		var col = columns[i];
		if(col.permit("filter")){
			if(col.type == "select" && Array.isArray(col.extra) && col.extra.length){
				filters.push({
					type: "select"
				  , options: extra
				});
			}
		}
	};
	return filters;
}
 */

/**
 * Query conditions
 *
 * Reserved option: page,sort,q
 */

table.where = function(obj){
	if(!arguments.length)
		return this._where || {};
	obj = extend({}, this._where, obj);
	//Clean page and sort
	delete obj.page;
	delete obj.sort;
	for(var key in obj){
		if((key != "q" && !this.hasColumn(key)) || obj[key] === ''){
			delete obj[key];
		}
	}
	this._where = obj;
	return this;
}

table.sort = function(name){
	if(!arguments.length)
		return this._sort || {name: this.primaryKey()};
	if(name) {
		var asc, name;
		if(typeof name == "object"){
			asc = name.asc;
			name = name.name;
		}else{
			asc = name.charAt(0) === "-";
			name = asc ? name.slice(1) : name;
		}
		name = name || this.primaryKey();
		if(this.hasColumn(name)){
			this._sort = {name: name, asc: asc};
		}
	}
	return this;
}

table.pager = function(page){
	if( !arguments.length )
		return this._pager;
	this._page = page;
	return this;
}

/**
 * @api private
 */

table._cond = function(){
	var cond = extend({}, this.where(), this.conditions());

	//The search param
	var q = cond.q
	  , search = this.search();
	if(search && q){
		cond.q = {
			type: "search"
		  , key: search.fields
		  , value: q
		};
	} else {
		delete cond.q;
	}

	return {
		conditions: cond
	};
}

table.all = function(clean, fn){
	if( typeof clean === "function" ){
		fn = clean;
		clean = false;
	}
	var self = this
	  , cond = self._cond();
	if( clean ) {
		self.db.all(self.name, cond, function(err, rows){
			fn && fn(err, rows);
		});
	} else {
		self.db.count(this.name, cond, function(err, num){
			self._pager = new pager(self._page, num, self.per_size);
			if(err)
				return fn && fn(err);
			cond.page = self.pager();
			cond.sort = self.sort();
			self.db.all(self.name, cond, function(err, rows){
				if(err)
					return fn && fn(err);
				self._filter(cond.conditions, function(err){
					fn && fn(err, rows);
				});
			});
		});
	}
	return this;
}

table.new = function(params, fn){
	var obj = {};
	this.columns().forEach(function(col){
		obj[col.name] = col.value;
	});
	extend(obj, params);
	this._filter(params, function(err){
		fn && fn(err, obj);
	});
}

table.find = function(id, fn, optionForFilter){
	var op = this._cond()
	  , self = this;
	op.conditions[this.primaryKey()] = id;
	this.db.find(this.name, op, function(err, row){
		if(err)
			return fn && fn(err);
		self._filter(optionForFilter || row, function(err){
			fn && fn(err, row);
		});
	});
	return this;
}

table.update = function(id, obj, fn){
	obj = obj || {};
	var op = this._cond()
	  , key = this.primaryKey();
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

	this.db.update(this.name, op, data, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

table.create = function(obj, fn){
	obj = obj || {};
	var key = this.primaryKey();

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
	op.conditions[this.primaryKey()] = id;
	this.db.delete(this.name, op, function(err, row){
		fn && fn(err, row);
	});
	return this;
}

/**
 * Fetch data for the filter column
 *
 * @api private
 */
table._filter = function(params, fn){
	async.eachSeries(this.columns(), function(col, done){
		var filter = col.filter();
		if(col.filter()){
			var where = {}
			  , scope = filter.scope
			  , table = filter.table.instance();
			if(scope){
				if(params && params[scope[0]] !== undefined){
					where[scope[1]] = params[scope[0]];
				} else {
					col.type = "select";
					col.extra = [];
					return done();
				}
			}
			table.where(where)
				.sort({asc:true})
				.all(true, function(err, rows){
					if( !err ){
						col.type = "select";
						col.extra = pair(rows, table.primaryKey(), filter.display);
					}
					done(err);
				});
		} else {
			done();
		}
	}, function(err){
		fn && fn(err);
	});
	return this;
}

/**
 * Fetch the associate data
 * @api private
 */

table._associate = function(){
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
		fn && fn( err, self );
	} );
	return this;
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


function pair(rows) {
	var fields = Array.prototype.slice.call(arguments,1);
	return rows.map(function( row ) {
		fields = fields.length ? fields : Object.keys(row);
		return fields.map(function(f){
			return row[f];
		});
	});
}

